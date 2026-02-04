import React from 'react';

const SettlementDocument = ({ data }) => {
    if (!data) return null;
    const { employee, aguinaldo, cesantia, total, breakdown, dates, aguinaldoTotal } = data;

    const entryDate = new Date(employee.hire_date);
    const exitDate = new Date(dates.exit);
    const diffTime = Math.abs(exitDate - entryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30.44);
    const antiquity = months >= 12 ? `${Math.floor(months / 12)} años, ${months % 12} meses` : `${months} meses`;

    return (
        <div id="settlement-print" style={{
            padding: '40px',
            backgroundColor: 'white',
            color: 'black',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            width: '800px',
            margin: '0 auto',
            minHeight: '1000px'
        }}>
            <style>
                {`
                @media print {
                    body * { visibility: hidden; }
                    #settlement-print, #settlement-print * { visibility: visible; }
                    #settlement-print { position: absolute; left: 0; top: 0; width: 100%; border: none; padding: 0; }
                }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid black; padding: 6px; text-align: left; }
                .header-table td { border: 1px solid black; text-align: center; font-weight: bold; }
                .info-grid { display: grid; grid-template-columns: 150px 1fr; border: 1px solid black; padding: 10px; margin-bottom: 20px; }
                .info-label { font-weight: bold; }
                `}
            </style>

            <table className="header-table">
                <tbody>
                    <tr><td>SODA TIENTOS</td></tr>
                    <tr><td>ERICKA OCAMPO BOGANTES</td></tr>
                    <tr><td>LIQUIDACIÓN LABORAL - {employee.contract_type.toUpperCase()}</td></tr>
                </tbody>
            </table>

            <div className="info-grid">
                <div className="info-label">Empleado</div><div>{employee.name}</div>
                <div className="info-label">Fecha de Ingreso</div><div>{entryDate.toLocaleDateString()}</div>
                <div className="info-label">Fecha de Salida</div><div>{exitDate.toLocaleDateString()}</div>
                <div className="info-label">Cédula</div><div>{employee.cedula || 'N/A'}</div>
                <div className="info-label">Antigüedad</div><div>{antiquity}</div>
                <div className="info-label">Tipo de pago</div><div>{employee.payment_type}</div>
                <div className="info-label">Cargo</div><div>{employee.position}</div>
                <div className="info-label">Tipo de Contrato</div><div>{employee.contract_type}</div>
            </div>

            <h3 style={{ textDecoration: 'underline', marginBottom: '10px' }}>LIQUIDACIÓN POR DESPIDO CON RESPONSABILIDAD PATRONAL</h3>
            <p><strong>Derecho de Aguinaldo</strong></p>
            <p style={{ borderBottom: '1px dotted black', paddingBottom: '4px' }}>El siguiente monto corresponde al calculo de derecho de Aguinaldo:</p>

            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                <table style={{ width: '300px' }}>
                    <tbody>
                        {Object.entries(breakdown || {}).map(([month, amount]) => (
                            <tr key={month}>
                                <td>{month}</td>
                                <td>₡{amount.toLocaleString()}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold', borderTop: '2px solid black' }}>
                            <td>TOTAL</td>
                            <td>₡{aguinaldoTotal.toLocaleString()} / 12 =</td>
                        </tr>
                    </tbody>
                </table>
                <div style={{ flex: 1, textAlign: 'right', paddingTop: '100px', fontWeight: 'bold' }}>
                    ₡{aguinaldo.toLocaleString()}
                </div>
            </div>

            <p style={{ marginTop: '20px' }}><strong>El siguiente monto corresponde al calculo de derecho de Cesantía:</strong></p>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid black', paddingBottom: '4px' }}>
                <span>Total Cesantía</span>
                <span style={{ fontWeight: 'bold' }}>₡{cesantia.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderBottom: '2px solid black', paddingBottom: '4px', fontSize: '14px' }}>
                <span style={{ fontWeight: 'bold' }}>Su liquidación total corresponde a:</span>
                <span style={{ fontWeight: 'bold' }}>₡{total.toLocaleString()}</span>
            </div>

            <p style={{ marginTop: '40px', fontSize: '11px' }}>
                <strong>Nota:</strong> Despido con Responsabilidad según el artículo 85 inciso D del Codigo de Trabajo.<br />
                En correspondiente se da a manifestar la liquidación de {employee.name} correspondiente según lo estipulado por el Codigo de Trabajo del Ministerio de Trabajo y Seguridad Social.
            </p>
            <p style={{ fontSize: '11px', marginTop: '10px' }}>El pago se efectua dentro de los 30 días siguientes en el transcurso de los corrientes.</p>

            <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ borderTop: '1px solid black', width: '250px', textAlign: 'center', paddingTop: '4px' }}>
                    {employee.name}<br />Recibido
                </div>
                <div style={{ borderTop: '1px solid black', width: '250px', textAlign: 'center', paddingTop: '4px' }}>
                    Firma de Patrono<br />Cédula: 6-0221-0851
                </div>
            </div>
        </div>
    );
};

export default SettlementDocument;
