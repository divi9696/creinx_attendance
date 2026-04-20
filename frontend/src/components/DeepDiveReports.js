import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, Calendar, ChevronDown, ChevronUp, Loader2,
  Building, Home, FileText, BarChart2, FileSpreadsheet
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DeepDiveReports = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance');
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/employees`, { headers: headers() });
      setEmployees(res.data.employees || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDossier = async (emp) => {
    if (selectedEmp?.id === emp.id) { setSelectedEmp(null); setDossier(null); return; }
    setSelectedEmp(emp);
    setDossierLoading(true);
    setDossier(null);
    setShowAllLogs(false);
    try {
      const res = await axios.get(`${API_URL}/admin/employee/${emp.id}/full-report`, { headers: headers() });
      setDossier(res.data);
    } catch (e) { console.error(e); }
    finally { setDossierLoading(false); }
  };

  const exportToPDF = () => {
    if (!dossier) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Employee Dossier: ${selectedEmp.name}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`ID: ${selectedEmp.employee_uid} | Dept: ${selectedEmp.department || 'N/A'}`, 14, 28);
    
    // Attendance Table
    doc.text('1. ATTENDANCE LOGS', 14, 40);
    const attColumns = ["Date", "In", "Out", "Mode", "IP"];
    const attRows = (dossier.attendance || []).map(r => [
      fmtDate(r.check_in),
      fmt(r.check_in),
      fmt(r.check_out),
      typeLabel(r.attendance_type),
      r.ip_address || '—'
    ]);
    doc.autoTable({ head: [attColumns], body: attRows, startY: 45, theme: 'striped' });

    // Monthly Report
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.text('2. MONTHLY SUMMARY', 14, finalY);
    const mthColumns = ["Month", "Office", "Remote", "Leave", "Total"];
    const mthRows = monthlyReport(dossier.attendance).map(([m, s]) => [m, s.office, s.home, s.leave, s.total]);
    doc.autoTable({ head: [mthColumns], body: mthRows, startY: finalY + 5, theme: 'grid' });

    doc.save(`dossier-${selectedEmp.name.replace(/\s+/g, '-')}.pdf`);
  };

  const exportToExcel = () => {
    if (!dossier) return;
    const header = ['Log Date', 'Check In', 'Check Out', 'Mode', 'IP Address'];
    const rows = (dossier.attendance || []).map(r => [
      fmtDate(r.check_in),
      fmtText(r.check_in),
      fmtText(r.check_out),
      typeLabel(r.attendance_type).toUpperCase(),
      r.ip_address || '—'
    ]);

    let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40"><Worksheet ss:Name="Dossier"><Table>`;
    
    // Metadata rows (Two columns for labels and values)
    xml += `<Row><Cell ss:StyleID="s62"><Data ss:Type="String">Employee Profile</Data></Cell></Row>`;
    xml += `<Row><Cell><Data ss:Type="String">Name:</Data></Cell><Cell><Data ss:Type="String">${selectedEmp.name}</Data></Cell></Row>`;
    xml += `<Row><Cell><Data ss:Type="String">UID:</Data></Cell><Cell><Data ss:Type="String">${selectedEmp.employee_uid}</Data></Cell></Row>`;
    xml += `<Row><Cell><Data ss:Type="String">Department:</Data></Cell><Cell><Data ss:Type="String">${selectedEmp.department || 'N/A'}</Data></Cell></Row>`;
    xml += '<Row></Row>';

    // Header row
    xml += '<Row>';
    header.forEach(h => xml += `<Cell ss:StyleID="s63"><Data ss:Type="String">${h}</Data></Cell>`);
    xml += '</Row>';

    // Data rows
    rows.forEach(row => {
      xml += '<Row>';
      row.forEach(cell => xml += `<Cell><Data ss:Type="String">${cell}</Data></Cell>`);
      xml += '</Row>';
    });

    xml += '</Table></Worksheet></Workbook>';

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dossier-${selectedEmp.employee_uid}-structural.xls`;
    link.click();
  };

  const fmt = (dt) => {
    if (!dt) return <span style={{ color: '#475569' }}>—</span>;
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const fmtDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Plain text formatter for exports
  const fmtText = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const typeIcon = (type) => {
    if (type === 'work_office') return <Building size={13} color="#4deaff" />;
    if (type === 'work_home') return <Home size={13} color="#a855f7" />;
    return <FileText size={13} color="#fbbf24" />;
  };

  const typeLabel = (type) => {
    if (type === 'work_office') return 'Office';
    if (type === 'work_home') return 'Remote';
    return 'Leave';
  };

  const typeColor = (type) => {
    if (type === 'work_office') return '#4deaff';
    if (type === 'work_home') return '#a855f7';
    return '#fbbf24';
  };

  const monthlyReport = (attendance) => {
    const grouped = {};
    (attendance || []).forEach(rec => {
      const d = new Date(rec.check_in);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = { office: 0, home: 0, leave: 0, total: 0 };
      if (rec.attendance_type === 'work_office') grouped[key].office++;
      else if (rec.attendance_type === 'work_home') grouped[key].home++;
      else grouped[key].leave++;
      grouped[key].total++;
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  };

  if (loading) return <div className="dossier-loading"><Loader2 size={24} className="spinner-icon" /> Initializing Dataset...</div>;

  return (
    <div className="deep-dive-reports">
      <div className="emp-dossier-list">
        {employees.map((emp) => (
          <div key={emp.id} className="emp-dossier-block">
            <motion.div
              whileHover={{ x: 3 }}
              className={`emp-dossier-header ${selectedEmp?.id === emp.id ? 'active' : ''}`}
              onClick={() => fetchDossier(emp)}
            >
              <div className="emp-dossier-avatar">{emp.name[0]}</div>
              <div className="emp-dossier-meta">
                <span className="d-name">{emp.name}</span>
                <span className="d-role">{emp.job_role || 'Staff'} · {emp.department || 'Main Ops'}</span>
              </div>
              <div className="d-action-icon">
                {selectedEmp?.id === emp.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </motion.div>

            <AnimatePresence>
              {selectedEmp?.id === emp.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="dossier-expand"
                >
                  {dossierLoading ? (
                    <div className="dossier-loading"><Loader2 size={20} className="spinner-icon" /> Loading detailed intelligence...</div>
                  ) : dossier ? (
                    <div className="dossier-content">
                      <div className="dossier-actions-row">
                        <button className="d-btn pdf" onClick={exportToPDF}><FileText size={14} /> EXPORT PDF</button>
                        <button className="d-btn excel" onClick={exportToExcel}><FileSpreadsheet size={14} /> EXPORT EXCEL</button>
                      </div>
                      <div className="dossier-tabs">
                        {['attendance', 'monthly', 'leaves'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`d-tab ${activeTab === tab ? 'active' : ''}`}
                          >
                            {tab === 'attendance' && <><Clock size={13} /> ATTENDANCE LOGS</>}
                            {tab === 'monthly' && <><BarChart2 size={13} /> MONTHLY REPORT</>}
                            {tab === 'leaves' && <><FileText size={13} /> LEAVE HISTORY</>}
                          </button>
                        ))}
                      </div>

                      {activeTab === 'attendance' && (
                        <div className="log-table-wrap">
                          <table className="log-table">
                            <thead>
                              <tr>
                                <th>DATE</th>
                                <th>CHECK-IN</th>
                                <th>CHECK-OUT</th>
                                <th>HOURS</th>
                                <th>TYPE</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(showAllLogs 
                                ? (dossier.attendance || []) 
                                : (dossier.attendance || []).slice(0, 5)
                              ).map((rec, i) => {
                                const hours = rec.check_out
                                  ? ((new Date(rec.check_out) - new Date(rec.check_in)) / 3600000).toFixed(1)
                                  : null;
                                return (
                                  <tr key={i} className="log-row">
                                    <td>{fmtDate(rec.check_in)}</td>
                                    <td><span className="t-in">{fmt(rec.check_in)}</span></td>
                                    <td><span className="t-out">{fmt(rec.check_out)}</span></td>
                                    <td><span className={hours ? 't-hrs' : 't-na'}>{hours ? `${hours}h` : 'Active'}</span></td>
                                    <td>
                                      <span className="t-type" style={{ color: typeColor(rec.attendance_type) }}>
                                        {typeIcon(rec.attendance_type)} {typeLabel(rec.attendance_type)}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {dossier.attendance?.length === 0 && <div className="empty-state">No records found.</div>}
                          {!showAllLogs && dossier.attendance?.length > 5 && (
                            <div className="view-more-container">
                              <button onClick={() => setShowAllLogs(true)} className="view-more-btn">
                                View More <ChevronDown size={14} />
                              </button>
                            </div>
                          )}
                          {showAllLogs && dossier.attendance?.length > 5 && (
                            <div className="view-more-container">
                              <button onClick={() => setShowAllLogs(false)} className="view-more-btn">
                                View Less <ChevronUp size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'monthly' && (
                        <div className="monthly-grid">
                          {monthlyReport(dossier.attendance).map(([month, stats]) => (
                            <div key={month} className="month-card">
                              <div className="month-label">{new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
                              <div className="month-stats">
                                <div className="m-stat office"><Building size={12} />{stats.office} Office</div>
                                <div className="m-stat home"><Home size={12} />{stats.home} Remote</div>
                                <div className="m-stat leave"><FileText size={12} />{stats.leave} Leave</div>
                                <div className="m-stat total">TOTAL {stats.total}</div>
                              </div>
                            </div>
                          ))}
                          {dossier.attendance?.length === 0 && <div className="empty-state">No records.</div>}
                        </div>
                      )}

                      {activeTab === 'leaves' && (
                        <div className="leave-history">
                          {(dossier.leaves || []).length === 0 ? (
                            <div className="empty-state">No leave history.</div>
                          ) : (
                            (dossier.leaves || []).map((lv, i) => (
                              <div key={i} className="lv-row">
                                <div className={`lv-status status-${lv.status}`}>{lv.status.toUpperCase()}</div>
                                <div className="lv-info">
                                  <span>{fmtDate(lv.start_date)} → {fmtDate(lv.end_date)}</span>
                                  <span className="lv-reason">"{lv.reason}"</span>
                                  {lv.decline_reason && <span className="lv-decline">Decline note: {lv.decline_reason}</span>}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <style jsx>{`
        .deep-dive-reports { width: 100%; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
        
        .emp-dossier-list { display: flex; flex-direction: column; gap: 12px; }
        .emp-dossier-block { border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }

        .emp-dossier-header {
          display: flex; align-items: center; gap: 15px;
          padding: 18px 20px; cursor: pointer;
          background: rgba(255,255,255,0.02); transition: 0.3s;
        }
        .emp-dossier-header:hover { background: rgba(255,255,255,0.04); }
        .emp-dossier-header.active { background: rgba(0,210,255,0.05); border-bottom: 1px solid rgba(0,210,255,0.1); }

        .emp-dossier-avatar {
          width: 42px; height: 42px; border-radius: 12px;
          border: 1px solid rgba(0,210,255,0.3); background: rgba(0,210,255,0.05);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; color: #4deaff;
        }
        .d-name { display: block; font-weight: 700; color: #fff; font-size: 0.95rem; }
        .d-role { font-size: 0.7rem; color: rgba(255,255,255,0.4); font-weight: 600; }
        .emp-dossier-meta { flex: 1; }
        .d-action-icon { color: rgba(255,255,255,0.3); }

        .dossier-expand { background: rgba(0,0,0,0.3); overflow: hidden; }
        .dossier-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 40px; color: rgba(255,255,255,0.4); font-size: 0.85rem; }

        .dossier-content { padding: 20px; }

        .dossier-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .d-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.4);
          font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; cursor: pointer;
          transition: 0.3s;
        }
        .d-tab:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .d-tab.active { background: rgba(0,210,255,0.1); color: #4deaff; border-color: rgba(0,210,255,0.2); }

        .dossier-actions-row { display: flex; gap: 10px; margin-bottom: 20px; }
        .d-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 8px; border: 1px solid transparent;
          font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: 0.3s;
        }
        .d-btn.pdf { background: rgba(239,68,68,0.08); color: #ef4444; border-color: rgba(239,68,68,0.2); }
        .d-btn.pdf:hover { background: #ef4444; color: #fff; }
        .d-btn.excel { background: rgba(34,197,94,0.08); color: #22c55e; border-color: rgba(34,197,94,0.2); }
        .d-btn.excel:hover { background: #22c55e; color: #fff; }

        .log-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .log-table { width: 100%; border-collapse: collapse; }
        .log-table th { padding: 12px 16px; text-align: left; font-size: 0.6rem; color: rgba(255,255,255,0.3); letter-spacing: 2px; font-weight: 900; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .log-row { border-bottom: 1px solid rgba(255,255,255,0.03); }
        .log-row td { padding: 12px 16px; font-size: 0.82rem; color: #cbd5e1; }
        .t-in { color: #22c55e; font-weight: 700; }
        .t-out { color: #ef4444; font-weight: 700; }
        .t-hrs { color: #4deaff; font-weight: 800; }
        .t-na { color: #475569; }
        .t-type { display: flex; align-items: center; gap: 5px; font-weight: 700; }

        .view-more-container { display: flex; justify-content: center; margin-top: 15px; }
        .view-more-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(0, 210, 255, 0.08); color: #4deaff;
          border: 1px solid rgba(0, 210, 255, 0.2); padding: 8px 24px;
          border-radius: 20px; font-size: 0.8rem; font-weight: 800; cursor: pointer; transition: 0.3s;
        }

        .monthly-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px; }
        .month-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 18px; }
        .month-label { font-weight: 800; color: #fff; margin-bottom: 14px; font-size: 0.9rem; }
        .month-stats { display: flex; flex-direction: column; gap: 8px; }
        .m-stat { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; }
        .m-stat.office { color: #4deaff; }
        .m-stat.home { color: #a855f7; }
        .m-stat.leave { color: #fbbf24; }
        .m-stat.total { color: #fff; font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: 4px; }

        .leave-history { display: flex; flex-direction: column; gap: 10px; }
        .lv-row { display: flex; gap: 15px; align-items: flex-start; padding: 14px; background: rgba(255,255,255,0.02); border-radius: 12px; }
        .lv-status { font-size: 0.6rem; font-weight: 900; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px; white-space: nowrap; }
        .status-approved { background: rgba(34,197,94,0.1); color: #22c55e; }
        .status-pending { background: rgba(251,191,36,0.1); color: #fbbf24; }
        .status-declined { background: rgba(239,68,68,0.1); color: #ef4444; }
        .lv-info { display: flex; flex-direction: column; gap: 4px; }
        .lv-info span { font-size: 0.8rem; color: #cbd5e1; font-weight: 600; }
        .lv-reason { font-style: italic; color: rgba(255,255,255,0.4) !important; }
        .lv-decline { color: #ef4444 !important; font-size: 0.72rem !important; }

        .empty-state { padding: 30px; text-align: center; color: rgba(255,255,255,0.4); font-size: 0.85rem; font-style: italic; }
        .spinner-icon { animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DeepDiveReports;
