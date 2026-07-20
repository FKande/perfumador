import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getFormula, getDilutions, addLine } from "../api/api";

const FormulaEditor = () => {
  const { id } = useParams();

  const [singleFormula, setSingleFormula] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dilutionsList, setDilutionsList] = useState([]);
  const [dilutionsLoading, setDilutionsLoading] = useState(true);
  const [dilutionsError, setDilutionsError] = useState(null);
  const [selectedDilutionId, setselectedDilutionId] = useState("");

  const [lineGrams, setLineGrams] = useState("");

  const loadDilutions = async () => {
    try {
      const data = await getDilutions();
      setDilutionsList(data);
    } catch (err) {
      setDilutionsError(true);
    } finally {
      setDilutionsLoading(false);
    }
  };

  const handleAddLine = async () => {

    if (isDilutionFormIncomplete) {
      return
    }

    await addLine(id, {
      dilution_id: selectedDilutionId,
      grams: Number(lineGrams),
    });
    refreshFormula();
    setselectedDilutionId("");
    setLineGrams("");
  };

  // just fire once on mount
  useEffect(() => {
    loadDilutions();
  }, []);

  useEffect(() => {
    refreshFormula();
  }, [id]);

  const refreshFormula = async () => {
    try {
      const data = await getFormula(id);
      setSingleFormula(data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => {
    if (typeof n !== "number") return "";
    return n.toFixed(3);
  };

  const displayName = (line) => {
    return line.common_name
      ? `${line.common_name} (${line.scientific_name})`
      : line.scientific_name;
  };

  const ifraLabel = (over) => {
    if (over === true) return "Over";
    if (over === false) return "OK";
    return ""; // null
  };

  const pickedDilution = dilutionsList.find(
    (d) => d.id === Number(selectedDilutionId),
  );

  const isDilutionFormIncomplete = (selectedDilutionId === "" || Number(lineGrams) <= 0)
  const isPreviewActive = !(!singleFormula || !lineGrams || !selectedDilutionId)

  const preview = useMemo(() => {
    if (!isPreviewActive) {
      return {
        previewAromaticGrams: null,
        previewTotalAromatic: null,
        previewTotalFinished: null,
        previewTotalConcentration: null,
        previewPercentOfAromatic: null,
        previewPercentOfFinished: null,
        previewOverIfra: null
      }
    }

    const previewAromaticGrams = Number(lineGrams) * pickedDilution?.dilution_percent / 100;
    const previewTotalAromatic = singleFormula.total_aromatic_grams + previewAromaticGrams;
    const previewTotalFinished = singleFormula.total_finished_grams + Number(lineGrams);

    const previewTotalConcentration = previewTotalAromatic / previewTotalFinished * 100;

    const previewPercentOfAromatic = previewAromaticGrams / previewTotalAromatic * 100;
    const previewPercentOfFinished = previewAromaticGrams / previewTotalFinished * 100;

    const previewOverIfra = pickedDilution.ifra_limit === null ? null : previewPercentOfFinished > pickedDilution.ifra_limit;

    return {
      previewAromaticGrams: previewAromaticGrams,
      previewTotalAromatic: previewTotalAromatic,
      previewTotalFinished: previewTotalFinished,
      previewTotalConcentration: previewTotalConcentration,
      previewPercentOfAromatic: previewPercentOfAromatic,
      previewPercentOfFinished: previewPercentOfFinished,
      previewOverIfra: previewOverIfra
    };

    // compute and return an object with the preview values
  }, [selectedDilutionId, lineGrams, singleFormula, pickedDilution]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;
  // if (!singleFormula) return null; // safety net if load finished but data is empty

  const vitalInfoArray = [
    { label: "Name", value: singleFormula.name },
    {
      label: "Total Aromatic",
      value: `${fmt(isPreviewActive ? preview.previewTotalAromatic : singleFormula.total_aromatic_grams)} g`
    },
    { label: "Ethanol", value: `${fmt(singleFormula.ethanol_grams)} g` },
    {
      label: "Total Finished",
      value: `${fmt(isPreviewActive ? preview.previewTotalFinished : singleFormula.total_finished_grams)} g`,
    },
    {
      label: "Concentration",
      value: `${fmt(isPreviewActive ? preview.previewTotalConcentration : singleFormula.concentration_percent)}%`,
    },
  ];

  return (
    <section className="basic-vertical-section">
      {/* <pre>{JSON.stringify(singleFormula, null, 2)}</pre> */}
      <div className="horizontal-row-centered-16">
        {vitalInfoArray.map(({ label, value }) => (
          <div key={label} className="horizontal-row-centered-0">
            <span className={isPreviewActive ? "table-header-preview-active" : ""}>
              {label}: {value}
            </span>
          </div>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th className="basic-table-header">Name</th>
            <th className="basic-table-header">Note</th>
            <th className="basic-table-header">Grams</th>
            <th className="basic-table-header">Dilution %</th>
            <th className="basic-table-header">Aromatic Grams</th>
            <th className="basic-table-header">% of Aromatic</th>
            <th className="basic-table-header">% of Finished</th>
            <th className="basic-table-header">IFRA Limit</th>
            <th className="basic-table-header">Over IFRA</th>
          </tr>
        </thead>
        <tbody>
          {singleFormula.lines.map((line) => (
            <tr key={line.id}>
              <td className="basic-table-cell">{displayName(line)}</td>
              <td className="basic-table-cell">{line.note}</td>
              <td className="basic-table-cell">{line.grams}</td>
              <td className="basic-table-cell">{line.dilution_percent}</td>
              <td className="basic-table-cell">{fmt(line.aromatic_grams)}</td>
              <td className="basic-table-cell">
                {fmt(line.percent_of_aromatic)}
              </td>
              <td className="basic-table-cell">
                {fmt(line.percent_of_finished)}
              </td>
              <td className="basic-table-cell">{fmt(line.ifra_limit)}</td>
              <td
                className={
                  line.over_ifra === true
                    ? "basic-table-cell over-ifra-cell"
                    : "basic-table-cell"
                }
              >
                {ifraLabel(line.over_ifra)}
              </td>
            </tr>
          ))}
          <tr>
            <td className="basic-table-cell">
              {dilutionsError && (
                <button onClick={() => loadDilutions()}>Retry</button>
              )}
              <select
                className="table-select"
                value={selectedDilutionId}
                onChange={(e) => setselectedDilutionId(e.target.value)}
              >
                <option value="">
                  {dilutionsError
                    ? "An error has occured, please retry"
                    : dilutionsLoading
                      ? "Loading dilutions..."
                      : "Add a line, select a dilution"}
                </option>
                {dilutionsList.map((singleDilution) => (
                  <option key={singleDilution.id} value={singleDilution.id}>
                    {singleDilution.scientific_name}{" "}
                    {singleDilution.common_name &&
                      ` (${singleDilution.common_name})`}{" "}
                    {singleDilution.dilution_percent}%{" "}
                    {singleDilution.remaining}g remaining
                  </option>
                ))}
              </select>
            </td>
            <td className="basic-table-cell">{pickedDilution?.note}</td>
            <td className="basic-table-cell">
              <input
                placeholder="Enter grams"
                type="number"
                value={lineGrams}
                onChange={(e) => setLineGrams(e.target.value)}
              />
            </td>
            <td className="basic-table-cell">
              {pickedDilution?.dilution_percent}
            </td>
            <td className="basic-table-cell">
              {/* aromatic grams */}
              {fmt(preview.previewAromaticGrams)}
            </td>
            <td className="basic-table-cell">
              {/* % of aromatic */}
              {fmt(preview.previewPercentOfAromatic)}
            </td>
            <td className="basic-table-cell">
              {/* % of finished */}
              {fmt(preview.previewPercentOfFinished)}
            </td>
            <td className="basic-table-cell">
              {/* IFRA limit */}
              {fmt(pickedDilution?.ifra_limit)}
            </td>
            <td className={preview.previewOverIfra === true ? "basic-table-cell over-ifra-cell" : "basic-table-cell" }>
              {/* over IFRA or no? */}
              {ifraLabel(preview.previewOverIfra)}
            </td>
          </tr>
        </tbody>
      </table>
      <button onClick={() => handleAddLine()} disabled={isDilutionFormIncomplete}>+ Add line to formula</button>
    </section>
  );
};

export default FormulaEditor;
