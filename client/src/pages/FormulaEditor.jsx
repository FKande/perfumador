import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFormula } from "../api/api";

const FormulaEditor = () => {
  const { id } = useParams();

  const [singleFormula, setSingleFormula] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFormula(id);
        setSingleFormula(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]); 

  const fmt = (n) => {
    if (typeof n !== "number") return ""
    return n.toFixed(3)
  }

  const displayName = (line) => {
    return line.common_name
    ? `${line.common_name} (${line.scientific_name})`
    : line.scientific_name
  }

  const ifraLabel = (over) => {
    if (over === true) return 'Over'
    if (over === false) return 'OK'
    return ''   // null
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Something went wrong.</p>
  if (!singleFormula) return null; // safety net if load finished but data is empty

  const vitalInfoArray = [
    { label: 'Name', value: singleFormula.name },
    { label: 'Total Aromatic', value: `${fmt(singleFormula.total_aromatic_grams)} g` },
    { label: 'Ethanol', value: `${fmt(singleFormula.ethanol_grams)} g` },
    { label: 'Total Finished', value: `${fmt(singleFormula.total_finished_grams)} g` },
    { label: 'Concentration', value: `${fmt(singleFormula.concentration_percent)}%` },
  ];

  return (
  <section className="basic-vertical-section">
      {/* <pre>{JSON.stringify(singleFormula, null, 2)}</pre> */}
      <div className='horizontal-row-centered-16'>
        {vitalInfoArray.map(({ label, value }) => (
          <div key={label} className='horizontal-row-centered-0'>
            {label}: {value}
          </div>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Note</th>
            <th>Grams</th>
            <th>Dilution %</th>
            <th>Aromatic Grams</th>
            <th>% of Aromatic</th>
            <th>% of Finished</th>
            <th>IFRA Limit</th>
            <th>Over IFRA</th>
          </tr>
        </thead>
        <tbody>
          {singleFormula.lines.map((line) => (
            <tr key={line.id}>
              <td>{displayName(line)}</td>              
              <td>{line.note}</td>
              <td>{line.grams}</td>
              <td>{line.dilution_percent}</td>
              <td>{fmt(line.aromatic_grams)}</td>
              <td>{fmt(line.percent_of_aromatic)}</td>
              <td>{fmt(line.percent_of_finished)}</td>
              <td>{fmt(line.ifra_limit)}</td>
              <td className={line.over_ifra === true ? "over-ifra-cell" : ""}>{ifraLabel(line.over_ifra)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default FormulaEditor;
