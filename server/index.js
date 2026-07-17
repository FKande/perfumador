import express from "express";
import cors from "cors";
import pg from "pg";
import "dotenv/config";

const app = express();

// enable CORS for all incoming requests
app.use(cors());

// parse incoming JSON request payloads
app.use(express.json());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// get all aromachemicals
app.get("/aromachemicals", async (req, res) => {
  const result = await pool.query("SELECT * FROM aromachemicals");
  res.json(result.rows);
});

// get all dilutions
app.get("/dilutions", async (req, res) => {
  const result = await pool.query(`
    SELECT
      dilutions.id,
      dilutions.dilution_percent,
      a.scientific_name,
      COALESCE(SUM(fl.grams),0) AS total_used,
      dilutions.initial_grams - COALESCE(SUM(fl.grams),0) AS remaining
    FROM dilutions
    LEFT JOIN formula_lines fl ON dilutions.id = fl.dilution_id
    LEFT JOIN aromachemicals a ON a.id = dilutions.aromachemical_id
    GROUP BY dilutions.id, dilutions.dilution_percent, a.scientific_name, dilutions.initial_grams 
    ORDER BY 
    a.scientific_name ASC
  `);
  res.json(result.rows);
});

// get all formulas
app.get("/formulas", async (req, res) => {
  const result = await pool.query("SELECT * FROM formulas");
  res.json(result.rows);
});

app.patch("/formulas/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, ethanol_grams } = req.body
  const result = await pool.query(`
    UPDATE formulas
    SET
      name = $1,
      description = $2,
      ethanol_grams = $3
    WHERE id = $4
    RETURNING *;
  `, [name, description, ethanol_grams, id])
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Formula not found' });
  }
  return res.status(200).json(result.rows[0])
})

// {
//   id: 1,
//   name: "Simple Rose Accord",
//   ethanol_grams: "40",
//   lines: [
//     {
//       id: 1,
//       scientific_name: "Citral (geranial + neral)",
//       grams: "2",
//       dilution_percent: "10",
//       note: "top",
//       ifra_limit: "0.6"
//     },
//     ... (8 more lines)
//   ]
// }

// {
//   id: 1,
//   name: "Simple Rose Accord",
//   ethanol_grams: "40",

//   total_aromatic_grams: 5.61,        ← NEW (formula-level)
//   total_finished_grams: 83,          ← NEW (sum of all line grams + ethanol)
//   concentration_percent: 6.76,       ← NEW (aromatic / finished × 100)

//   lines: [
//     {
//       id: 1,
//       scientific_name: "Citral (geranial + neral)",
//       grams: "2",
//       dilution_percent: "10",
//       note: "top",
//       ifra_limit: "0.6",

//       aromatic_grams: 0.2,           ← NEW (2 × 10/100)  [optional but useful]
//       percent_of_aromatic: 3.57,     ← NEW (0.2 / 5.61 × 100)
//       percent_of_finished: 0.24,     ← NEW (0.2 / 83 × 100)
//       over_ifra: false               ← NEW (0.24 > 0.6? no → false)
//     },
//     ...
//   ]
// }

// get a specific formula
app.get("/formulas/:id", async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `
        SELECT
        f.id AS formula_id,
        f.name,
        f.ethanol_grams,
        fl.id AS line_id,
        fl.grams,
        d.dilution_percent,
        a.common_name,
        a.scientific_name,
        a.note,
        a.ifra_limit
        FROM formulas f
        LEFT JOIN formula_lines fl ON fl.formula_id = f.id
        LEFT JOIN dilutions d ON d.id = fl.dilution_id
        LEFT JOIN aromachemicals a ON a.id = d.aromachemical_id
        WHERE f.id = $1
        ORDER BY
          CASE a.note
            WHEN 'top' THEN 1
            WHEN 'mid' THEN 2
            WHEN 'base' THEN 3
          END,
          fl.id
    `, [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "ERROR" })
  }

  let total_aromatic_grams = 0
  let total_finished_grams = 0

  let resultObj = { id: result.rows[0].formula_id, name: result.rows[0].name, ethanol_grams: Number(result.rows[0].ethanol_grams), lines: [] }
  for (let i = 0; i < result.rows.length; i++) {
    if (result.rows[i].line_id === null) {
      continue
    }
    total_aromatic_grams += Number(result.rows[i].grams) * Number(result.rows[i].dilution_percent) / 100
    total_finished_grams += Number(result.rows[i].grams)

    resultObj.lines.push({id: result.rows[i].line_id, common_name: result.rows[i].common_name, scientific_name: result.rows[i].scientific_name, grams: Number(result.rows[i].grams), dilution_percent: Number(result.rows[i].dilution_percent), note: result.rows[i].note, ifra_limit: result.rows[i].ifra_limit === null ? null : Number(result.rows[i].ifra_limit) })
  }

  total_finished_grams += Number(result.rows[0].ethanol_grams)
  let concentration_percent = total_aromatic_grams / total_finished_grams * 100

  resultObj.total_aromatic_grams = total_aromatic_grams
  resultObj.total_finished_grams = total_finished_grams
  resultObj.concentration_percent = concentration_percent


  for (const line of resultObj.lines) {
    const aromatic_grams = Number(line.grams) * Number(line.dilution_percent) / 100
    line.aromatic_grams = aromatic_grams
    line.percent_of_aromatic = aromatic_grams / total_aromatic_grams * 100
    const percent_of_finished = aromatic_grams / total_finished_grams * 100
    line.percent_of_finished = percent_of_finished
    line.over_ifra = line.ifra_limit === null ? null : percent_of_finished > Number(line.ifra_limit)
  }

  res.json(resultObj)
});

// create a formula
app.post("/formulas", async (req, res) => {
  const { name, description } = req.body
  const result = await pool.query(
    "INSERT INTO formulas (name, description) VALUES ($1, $2) RETURNING *",
    [name, description]
  )
  res.status(201).json(result.rows[0])
})

// add an aromachemical to the catalog of aromachemicals
app.post("/aromachemicals", async (req, res) => {
  const { scientific_name, common_name, cas_number, note, ifra_limit } = req.body
  const result = await pool.query(
    "INSERT INTO aromachemicals (scientific_name, common_name, cas_number, note, ifra_limit) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [scientific_name, common_name, cas_number, note, ifra_limit]
  );
  res.status(201).json(result.rows[0])
})

// create a diluton
app.post("/dilutions", async (req, res) => {
  const { aromachemical_id, dilution_percent, initial_grams } = req.body
  const result = await pool.query(
    "INSERT INTO dilutions (aromachemical_id, dilution_percent, initial_grams) VALUES ($1, $2, $3) RETURNING *",
    [aromachemical_id, dilution_percent, initial_grams]
  )
  res.status(201).json(result.rows[0])
})

// add a line to a formula
app.post("/formulas/:id/lines", async (req, res) => {
  const formula_id = req.params.id
  const { dilution_id, grams } = req.body

  if (grams <= 0) {
    return res.status(400).json({ error: "grams must be positive" });
  }

  const result = await pool.query(
    "INSERT INTO formula_lines (formula_id, dilution_id, grams) VALUES ($1, $2, $3) RETURNING *",
    [formula_id, dilution_id, grams]
  )
  res.status(201).json(result.rows[0])
})

// delete a specific formula
app.delete("/formulas/:id", async (req, res) => {
  const { id } = req.params
  const result = await pool.query("DELETE FROM formulas WHERE id = $1", [id])

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "does not exist" })
  }
  res.status(204).send()
})

// delete a specific line from a formula
app.delete("/formulas/:id/lines/:lineId", async (req, res) => {
  const { id, lineId } = req.params
  const result = await pool.query("DELETE FROM formula_lines WHERE id = $1 AND formula_id = $2", [lineId, id])
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "does not exist" })
  }
  res.status(204).send()
})

// get a top/mid/base percentage breakdown for a given formula
app.get("/formulas/:id/breakdown", async (req, res) => {
  const { id } = req.params
  const result = await pool.query(
    `
    SELECT
    a.note,
    SUM(fl.grams * d.dilution_percent / 100) AS material
    FROM formula_lines fl
    JOIN dilutions d ON d.id = fl.dilution_id
    JOIN aromachemicals a ON a.id = d.aromachemical_id
    WHERE fl.formula_id = $1
    GROUP BY a.note
    ORDER BY
    CASE a.note
      WHEN 'top' THEN 1
      WHEN 'mid' THEN 2
      WHEN 'base' THEN 3
    END
    `, [id]
  )
  const rows = result.rows

  let tempSum = 0
  for (let i = 0; i < rows.length; i++) {
    tempSum += parseFloat(rows[i]["material"])
  }

  let finalPercentages = []
  for (let i = 0; i < rows.length; i++) {
    let percentage = (parseFloat(rows[i]["material"]) / tempSum) * 100
    finalPercentages.push({
      note: rows[i]["note"],           // ← keep the label
      percentage: percentage
    })
  }

  res.json(finalPercentages)
})





app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("I jus wanna roll it back to 2016");
});
