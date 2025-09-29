// client/src/admin/CrudPage.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../AuthContext';

const CrudPage = ({ title, baseUrl, fields }) => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const empty = useMemo(() => Object.fromEntries(fields.map(f => [f, ''])), [fields]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = () => {
    fetch(baseUrl, { headers }).then(r => r.json()).then(d => setData(d.data || []));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const startEdit = (row) => { setEditingId(row.id); setForm(fields.reduce((o,f)=>({ ...o, [f]: row[f] ?? '' }), {})); };
  const cancel = () => { setEditingId(null); setForm(empty); };

  const save = async () => {
    if (editingId) {
      await fetch(`${baseUrl}/${editingId}`, { method: 'PUT', headers, body: JSON.stringify(form) });
    } else {
      await fetch(baseUrl, { method: 'POST', headers, body: JSON.stringify(form) });
    }
    cancel(); load();
  };
  const remove = async (id) => {
    await fetch(`${baseUrl}/${id}`, { method: 'DELETE', headers });
    load();
  };

  return (
    <>
      <h1>{title}</h1>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.6rem', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
          {fields.map((f) => (
            <div key={f}>
              <label style={{ fontSize: 12, color: 'var(--accent)' }}>{f}</label>
              <input className="admin-input" value={form[f] || ''} onChange={e => setForm({ ...form, [f]: e.target.value })} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <button className="btn" onClick={save}>{editingId ? 'Mettre à jour' : 'Créer'}</button>
          {editingId && <button className="btn ghost" style={{ marginLeft: 8 }} onClick={cancel}>Annuler</button>}
        </div>
      </div>

      <div className="card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              {fields.map(f => <th key={f}>{f}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                {fields.map(f => <td key={f}>{row[f]}</td>)}
                <td>
                  <button className="btn" onClick={() => startEdit(row)}>Éditer</button>
                  <button className="btn danger" style={{ marginLeft: 6 }} onClick={() => remove(row.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CrudPage;
