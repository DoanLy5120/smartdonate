import { useState } from "react";
import {
  FiSearch, FiCheck, FiX, FiEye,
  FiFolder, FiClock, FiCheckCircle, FiXCircle,
} from "react-icons/fi";
import "./Projects.scss";

const PROJECTS = [
  { id:1,  name:"Giảm thiệt hại thiên tai miền Trung", org:"Hội Chữ Thập Đỏ",   category:"Thiên tai",  goal:"1 tỷ",  raised:"890tr", daysLeft:3,  status:"active",  submitted:"10/03/2025" },
  { id:2,  name:"Xây trường cho trẻ em vùng cao",       org:"QUỹ Giáo Dục VN",   category:"Giáo dục",   goal:"1 tỷ",  raised:"750tr", daysLeft:12, status:"pending", submitted:"14/03/2025" },
  { id:3,  name:"Hỗ trợ người già neo đơn Hà Nội",      org:"Thịnh Phát Group",  category:"Xóa nghèo",  goal:"500tr", raised:"200tr", daysLeft:20, status:"active",  submitted:"05/03/2025" },
  { id:4,  name:"Học bổng trẻ em vùng sâu",             org:"QUỹ Trẻ Em VN",     category:"Giáo dục",   goal:"600tr", raised:"180tr", daysLeft:8,  status:"pending", submitted:"16/03/2025" },
  { id:5,  name:"Trồng rừng phòng hộ miền Bắc",         org:"Hội Bảo Vệ MT",     category:"Môi trường", goal:"400tr", raised:"80tr",  daysLeft:14, status:"rejected",submitted:"02/03/2025" },
  { id:6,  name:"Nước sạch cho bản làng Tây Bắc",       org:"UNICEF Việt Nam",    category:"Môi trường", goal:"250tr", raised:"95tr",  daysLeft:20, status:"active",  submitted:"01/03/2025" },
];

const STATUS_MAP = {
  active:   { label:"Đang chạy",  cls:"green" },
  pending:  { label:"Chờ duyệt",  cls:"yellow" },
  rejected: { label:"Từ chối",    cls:"red" },
};

export default function Projects() {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [projects, setProjects] = useState(PROJECTS);

  const filtered = projects.filter(p => {
    const m = p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.org.toLowerCase().includes(search.toLowerCase());
    const f = filter === "all" ? true : p.status === filter;
    return m && f;
  });

  function approve(id) {
    setProjects(prev => prev.map(p => p.id===id ? {...p,status:"active"} : p));
  }

  function reject(id) {
    setProjects(prev => prev.map(p => p.id===id ? {...p,status:"rejected"} : p));
  }

  const stats = [
    { label:"Tổng dự án",   val:PROJECTS.length,                              c:"#dfdbfd" },
    { label:"Đang chạy",    val:PROJECTS.filter(p=>p.status==="active").length,   c:"#d6fce4" },
    { label:"Chờ duyệt",    val:PROJECTS.filter(p=>p.status==="pending").length,  c:"#f8ebd4" },
    { label:"Từ chối",      val:PROJECTS.filter(p=>p.status==="rejected").length, c:"#f9d0d0" },
  ];

  return (
    <div className="prj">
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph__title">📂 Dự án</h1>
          <p className="adm-ph__sub">Quản lý và duyệt chiến dịch gây quỹ</p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="prj__mini-stats">
        {stats.map((s,i) => (
          <div key={i} className="prj__mini-stat" style={{"background": s.c}}>
            <div className="prj__mini-val">{s.val}</div>
            <div className="prj__mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="adm-box">
        <div className="adm-box__head">
          <span className="adm-box__title">
            <FiFolder size={15}/> Danh sách dự án
            <span className="adm-box__badge">{filtered.length}</span>
          </span>
          <div className="adm-box__actions">
            <div className="prj__search">
              <FiSearch size={14}/>
              <input
                placeholder="Tìm dự án..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
                style={{background:"none",border:"none",outline:"none",color:"#e2e8f0",fontSize:13,width:150}}
              />
            </div>
            <select className="adm-select" value={filter} onChange={e=>setFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="active">Đang chạy</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>

        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Dự án</th>
                <th>Danh mục</th>
                <th>Tiến độ</th>
                <th>Còn lại</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__icon">📂</div><div className="adm-empty__text">Không có dự án</div></div></td></tr>
              ) : filtered.map((p,i) => {
                const pct = Math.round(parseInt(p.raised)*100/parseInt(p.goal));
                return (
                  <tr key={p.id} style={{animationDelay:`${i*0.05}s`}}>
                    <td style={{color:"#333",fontSize:12}}>{String(p.id).padStart(3,"0")}</td>
                    <td>
                      <div style={{fontWeight:700,fontSize:13.5,marginBottom:3}}>{p.name}</div>
                      <div style={{fontSize:12,color:"rgba(51, 51, 51, 0.6)"}}>{p.org}</div>
                    </td>
                    <td><span className="adm-tag adm-tag--blue">{p.category}</span></td>
                    <td style={{minWidth:160}}>
                      <div className="prj__progress">
                        <div className="prj__progress-bar">
                          <div className="prj__progress-fill" style={{width:`${pct}%`}}/>
                        </div>
                        <span className="prj__progress-pct">{pct}%</span>
                      </div>
                      <div style={{fontSize:11.5,color:"rgba(51, 51, 51, 0.6)",marginTop:4}}>
                        {p.raised} / {p.goal}
                      </div>
                    </td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:4,fontSize:13}}>
                        <FiClock size={12} style={{color:"#f59e0b"}}/>
                        {p.daysLeft} ngày
                      </div>
                    </td>
                    <td><span className={`adm-tag adm-tag--${STATUS_MAP[p.status].cls}`}>{STATUS_MAP[p.status].label}</span></td>
                    <td>
                      <div className="prj__actions">
                        <button className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--icon" title="Xem chi tiết">
                          <FiEye size={13}/>
                        </button>
                        {p.status === "pending" && (
                          <>
                            <button className="adm-btn adm-btn--success adm-btn--sm" onClick={()=>approve(p.id)}>
                              <FiCheck size={12}/> Duyệt
                            </button>
                            <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={()=>reject(p.id)}>
                              <FiX size={12}/> Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}