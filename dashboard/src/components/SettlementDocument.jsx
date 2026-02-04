import React from 'react';

const SettlementDocument = ({ data }) => {
    if (!data) return null;
    const { employee, aguinaldo, cesantia, total, breakdown, dates, aguinaldoTotal } = data;

    const entryDate = new Date(employee.hire_date);
    const exitDate = new Date(dates.exit);
    const diffTime = Math.abs(exitDate - entryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Antiguedad calculation logic
    let years = Math.floor(diffDays / 365);
    let months = Math.floor((diffDays % 365) / 30.41);
    const antiquity = years > 0 ? `${years} años, ${months} meses` : `${months} meses`;

    // Format numbers
    const fmt = (num) => Number(num).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div id="settlement-print" style={{
            padding: '40px',
            backgroundColor: 'white',
            color: 'black',
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '11pt',
            width: '210mm',
            margin: '0 auto',
            minHeight: '297mm',
            lineHeight: '1.2'
        }}>
            <style>
                {`
                @media print {
                    body { background: white; margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                    #settlement-print { width: 100%; border: none; padding: 10mm; }
                }
                #settlement-print table { width: 100%; border-collapse: collapse; margin: 0; }
                #settlement-print td { border: 1px solid black; padding: 4px 8px; vertical-align: middle; }
                #settlement-print .label { font-weight: bold; width: 140px; }
                #settlement-print .header-box { text-align: center; font-weight: bold; font-size: 13pt; margin-bottom: 20px; border: 1px solid black; padding: 5px; }
                #settlement-print .sub-header { border-top: none; padding: 2px; }
                #settlement-print .dots-line { border-bottom: 2px dotted black; height: 10px; margin: 15px 0; }
                #settlement-print .signature-line { border-top: 1px solid black; width: 250px; text-align: left; margin-top: 40px; padding-top: 5px; }
                `}
            </style>

            {/* Header Block */}
            <div className="header-box">
                SODA TIENTOS<br />
                ERICKA OCAMPO BOGANTES<br />
                LIQUIDACIÓN LABORAL - {employee.contract_type.toUpperCase()}
            </div>

            {/* Info Grid */}
            <table>
                <tbody>
                    <tr>
                        <td className="label">Empleado</td>
                        <td>{employee.name}</td>
                        <td className="label">Salario Diario Prom</td>
                        <td>₡{fmt(employee.daily_salary)}</td>
                    </tr>
                    <tr>
                        <td className="label">Fecha de Ingreso</td>
                        <td>{entryDate.toLocaleDateString('es-CR')}</td>
                        <td className="label">Fecha de Salida</td>
                        <td>{exitDate.toLocaleDateString('es-CR')}</td>
                    </tr>
                    <tr>
                        <td className="label">Cédula</td>
                        <td>{employee.cedula || 'N/A'}</td>
                        <td className="label">Antigüedad</td>
                        <td>{antiquity}</td>
                    </tr>
                    <tr>
                        <td className="label">Tipo de pago</td>
                        <td>{employee.payment_type}</td>
                        <td className="label">Cargo</td>
                        <td>{employee.position}</td>
                    </tr>
                    <tr>
                        <td className="label">Tipo de Contrato</td>
                        <td colSpan="3">{employee.contract_type}</td>
                    </tr>
                </tbody>
            </table>

            <div style={{ marginTop: '20px', fontWeight: 'bold', textDecoration: 'underline' }}>
                LIQUIDACIÓN POR DESPIDO CON RESPONSABILIDAD PATRONAL
            </div>
            <div style={{ fontWeight: 'bold', marginTop: '5px' }}>Derecho de Aguinaldo</div>

            <div className="dots-line"></div>

            <p style={{ fontSize: '10pt', fontStyle: 'italic', marginBottom: '15px' }}>
                El siguiente monto corresponde al cálculo de derecho de Aguinaldo:
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <table style={{ width: '45%', border: 'none' }}>
                    <tbody>
                        {Object.entries(breakdown || {}).map(([month, amount]) => (
                            <tr key={month}>
                                <td style={{ border: '1px solid black', backgroundColor: '#f9f9f9' }}>{month}</td>
                                <td style={{ border: '1px solid black', textAlign: 'right' }}>₡{fmt(amount)}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold' }}>
                            <td style={{ border: '1px solid black' }}>TOTAL</td>
                            <td style={{ border: '1px solid black', textAlign: 'right' }}>₡{fmt(aguinaldoTotal)} / 12 =</td>
                        </tr>
                    </tbody>
                </table>
                <div style={{ width: '30%', textAlign: 'right', borderBottom: '1px solid black', paddingBottom: '2px', fontWeight: 'bold', fontSize: '12pt', marginTop: 'auto' }}>
                    ₡{fmt(aguinaldo)}
                </div>
            </div>

            <p style={{ marginTop: '20px', fontSize: '10pt', fontWeight: 'bold' }}>
                El siguiente monto corresponde al cálculo de derecho de Cesantía:
            </p>
            <p style={{ fontSize: '9pt', opacity: 0.8, marginBottom: '10px' }}>
                1. Después de un trabajo continuo no menor de tres meses ni mayor de seis, un importe igual a siete días de salario.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <span style={{ fontWeight: 'bold' }}>Total Cesantía</span>
                <span style={{ width: '150px', borderBottom: '1px solid black', textAlign: 'right', fontWeight: 'bold' }}>₡{fmt(cesantia)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '2px solid black', paddingTop: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '12pt' }}>Su liquidación total corresponde a:</span>
                <span style={{ width: '200px', borderBottom: '2px solid black', textAlign: 'right', fontWeight: 'bold', fontSize: '14pt' }}>₡{fmt(total)}</span>
            </div>

            <p style={{ marginTop: '30px', fontSize: '9pt', textAlign: 'justify' }}>
                <strong>Nota:</strong> Despido con Responsabilidad según el artículo 85 inciso D del Código de Trabajo.<br />
                En correspondiente se da a manifestar la liquidación de {employee.name} correspondiente según lo estipulado por el Código de Trabajo del Ministerio de Trabajo y Seguridad Social.
            </p>

            <p style={{ fontSize: '9pt', textAlign: 'center', marginTop: '15px', fontWeight: 'bold' }}>
                El pago se efectúa dentro de los 30 días siguientes en el transcurso de los corrientes.
            </p>

            <div style={{ marginTop: '60px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{employee.name}</div>
                <div className="signature-line">Firma Recibido:</div>
                <div style={{ marginTop: '5px' }}>Cédula: {employee.cedula || '____________________'}</div>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'right' }}>
                <div className="signature-line" style={{ marginLeft: 'auto', textAlign: 'right' }}>Firma de Patrono</div>
                <div style={{ marginTop: '5px' }}>Cédula: 6-0221-0851</div>
            </div>
        </div>
    );
};

export default SettlementDocument;
