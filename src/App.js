// src/App.js
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';

const NUM_UTILAJE = 10;
const TIPURI_OPRIRI = ['Tehnice', 'De proces', 'Altele']; // Poți adăuga mai multe

// Inițializează datele pentru utilaje
const initialUtilaje = Array.from({ length: NUM_UTILAJE }, (_, index) => ({
  id: index + 1,
  operatori: [1, 2, 4][index % 3], // Ciclic: 1, 2, 4, 1, 2, 4... pentru varietate
  timpFunctionare: 0,
  opriri: TIPURI_OPRIRI.reduce((acc, tip) => ({ ...acc, [tip]: 0 }), {}),
  bucatiProduse: 0,
}));


function App() {
  const [utilaje, setUtilaje] = useState(initialUtilaje);
  const timpTotalDisponibil = 480; // 8 ore/zi în minute – ajustează după nevoie

  useEffect(() => {
    // Încarcă din localStorage la start
    const saved = localStorage.getItem('utilajeData');
    if (saved) setUtilaje(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Salvează în localStorage la schimbare
    localStorage.setItem('utilajeData', JSON.stringify(utilaje));
  }, [utilaje]);

  const handleInputChange = (id, field, value) => {
    setUtilaje(utilaje.map(u => 
      u.id === id ? { ...u, [field]: parseInt(value) || 0 } : u
    ));
  };

  const handleOprireChange = (id, tip, value) => {
    setUtilaje(utilaje.map(u => 
      u.id === id ? { ...u, opriri: { ...u.opriri, [tip]: parseInt(value) || 0 } } : u
    ));
  };

  const calculeazaTimpOpririTotal = (opriri) => 
    Object.values(opriri).reduce((sum, min) => sum + min, 0);

  const calculeazaEficienta = (timpFunctionare, timpOpriri) => {
    const timpUtil = timpFunctionare + timpOpriri;
    return ((timpFunctionare / timpTotalDisponibil) * 100).toFixed(2);
  };

  const calculeazaProductivitate = (bucati, timpFunctionare, operatori) => 
    timpFunctionare > 0 ? (bucati / (timpFunctionare * operatori)).toFixed(2) : 0;

  // Poți adăuga OEE: Disponibilitate (eficiența) * Performanță (bucăți reale vs ideale) * Calitate (bucăți bune vs totale)
  // Pentru simplitate, presupunem performanță = 1 și calitate = 1; adaugă câmpuri extra dacă vrei.

  return (
    <Container className="mt-4">
      <h1>Monitorizare Performanță Utilaje Fabrică</h1>
      {utilaje.map(utilaj => {
        const timpOpriri = calculeazaTimpOpririTotal(utilaj.opriri);
        const eficienta = calculeazaEficienta(utilaj.timpFunctionare, timpOpriri);
        const productivitate = calculeazaProductivitate(utilaj.bucatiProduse, utilaj.timpFunctionare, utilaj.operatori);

        return (
          <Card key={utilaj.id} className="mb-3">
            <Card.Header>Utilaj {utilaj.id} ({utilaj.operatori} operatori)</Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Timp funcționare (minute)</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={utilaj.timpFunctionare} 
                        onChange={(e) => handleInputChange(utilaj.id, 'timpFunctionare', e.target.value)} 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Număr bucăți produse</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={utilaj.bucatiProduse} 
                        onChange={(e) => handleInputChange(utilaj.id, 'bucatiProduse', e.target.value)} 
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <h5>Opriri (minute per tip)</h5>
                <Row>
                  {TIPURI_OPRIRI.map(tip => (
                    <Col md={4} key={tip}>
                      <Form.Group>
                        <Form.Label>{tip}</Form.Label>
                        <Form.Control 
                          type="number" 
                          value={utilaj.opriri[tip]} 
                          onChange={(e) => handleOprireChange(utilaj.id, tip, e.target.value)} 
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </Form>
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>KPI</th>
                    <th>Valoare</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Eficiența timpului (%)</td>
                    <td>{eficienta}%</td>
                  </tr>
                  <tr>
                    <td>Productivitate (bucăți/min/operator)</td>
                    <td>{productivitate}</td>
                  </tr>
                  <tr>
                    <td>Timp opriri total (minute)</td>
                    <td>{timpOpriri}</td>
                  </tr>
                  {/* Adaugă mai mulți KPI aici, ex. OEE */}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        );
      })}
    </Container>
  );
}

export default App;