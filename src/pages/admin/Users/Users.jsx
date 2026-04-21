import { useState } from "react";
import {
  FiSearch, FiFilter, FiUserCheck,
  FiUserX, FiEye, FiShield, FiUser,
} from "react-icons/fi";
import "./Users.scss";

const USERS = [
  { id:1,  name:"Nguyễn Thị Mai",  email:"mai@gmail.com",  role:"user",   status:"active",  org:false, joined:"12/01/2025", reports:0  },
  { id:2,  name:"Hội Chữ Thập Đỏ", email:"hctd@org.vn",    role:"org",    status:"pending", org:true,  joined:"03/02/2025", reports:0  },
  { id:3,  name:"Trần Văn Hùng",   email:"hung@gmail.com", role:"user",   status:"blocked", org:false, joined:"28/01/2025", reports:3  },
  { id:4,  name:"Thịnh Phát Group", email:"tp@company.vn", role:"org",    status:"active",  org:true,  joined:"15/12/2024", reports:0  },
  { id:5,  name:"Lê Thị Bình",     email:"binh@gmail.com", role:"user",   status:"active",  org:false, joined:"05/03/2025", reports:1  },
  { id:6,  name:"QUỹ Trẻ Em VN",   email:"qtevn@fund.vn",  role:"org",    status:"pending", org:true,  joined:"20/02/2025", reports:0  },
  { id:7,  name:"Phạm Quốc An",    email:"an@gmail.com",   role:"user",   status:"active",  org:false, joined:"10/03/2025", reports:0  },
  { id:8,  name:"Hoàng Thị Lan",   email:"lan@gmail.com",  role:"user",   status:"blocked", org:false, joined:"01/02/2025", reports:5  },
];

const STATUS_MAP = {
  active:  { label:"Hoạt động", cls:"green" },
  pending: { label:"Chờ duyệt", cls:"yellow" },
  blocked: { label:"Đã khóa",   cls:"red" },
};

const ROLE_MAP = {
  user: { label:"Người dùng",  cls:"blue" },
  org:  { label:"Tổ chức",     cls:"purple" },
};

export default function Users() {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [users, setUsers]     = useState(USERS);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true :
                        filter === "org"     ? u.org :
                        filter === "pending" ? u.status === "pending" :
                        filter === "blocked" ? u.status === "blocked" : true;
    return matchSearch && matchFilter;
  });

  function toggleBlock(id) {
    setUsers(prev => prev.map(u =>
      u.id === id
        ? { ...u, status: u.status === "blocked" ? "active" : "blocked" }
        : u
    ));
  }

  function approveOrg(id) {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: "active" } : u
    ));
  }

  return (
    <div className="usr">
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph__title">👥 Người dùng</h1>
          <p className="adm-ph__sub">{USERS.length} tài khoản trong hệ thống</p>
        </div>
      </div>

      {/* Stats mini */}
      <div className="usr__mini-stats">
        {[
          { label:"Tổng",        val: USERS.length,                              c:"#dfdbfd" },
          { label:"Hoạt động",   val: USERS.filter(u=>u.status==="active").length,  c:"#d6fce4" },
          { label:"Chờ duyệt",   val: USERS.filter(u=>u.status==="pending").length, c:"#f8ebd4" },
          { label:"Đã khóa",     val: USERS.filter(u=>u.status==="blocked").length, c:"#f9d0d0" },
        ].map((s,i) => (
          <div key={i} className="usr__mini-stat" style={{"background":s.c}}>
            <div className="usr__mini-val">{s.val}</div>
            <div className="usr__mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="adm-box">
        <div className="adm-box__head">
          <span className="adm-box__title">
            <FiUser size={15}/> Danh sách tài khoản
            <span className="adm-box__badge">{filtered.length}</span>
          </span>
          <div className="adm-box__actions">
            {/* Search */}
            <div className="usr__search">
              <FiSearch size={14}/>
              <input
                className="adm-input"
                placeholder="Tìm theo tên, email..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
                style={{border:"none",background:"none",outline:"none",color:"#e2e8f0",fontSize:13,width:160}}
              />
            </div>
            {/* Filter */}
            <select className="adm-select" value={filter} onChange={e=>setFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="org">Tổ chức</option>
              <option value="pending">Chờ duyệt</option>
              <option value="blocked">Đã khóa</option>
            </select>
          </div>
        </div>

        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Tham gia</th>
                <th>Vi phạm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__icon">👤</div><div className="adm-empty__text">Không tìm thấy người dùng</div></div></td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id} style={{animationDelay:`${i*0.05}s`}}>
                  <td style={{color:"#333",fontSize:12}}>{String(u.id).padStart(3,"0")}</td>
                  <td>
                    <div className="usr__user-cell">
                      <div className="adm-avatar" style={{background: u.org ? "linear-gradient(135deg,#7c6df0,#f43f5e)" : "linear-gradient(135deg,#3b82f6,#22c55e)"}}>
                        {u.name[0]}
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:13.5}}>{u.name}</div>
                        <div style={{fontSize:12,color:"var(--adm-text-sub)"}}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`adm-tag adm-tag--${ROLE_MAP[u.role].cls}`}>{ROLE_MAP[u.role].label}</span></td>
                  <td><span className={`adm-tag adm-tag--${STATUS_MAP[u.status].cls}`}>{STATUS_MAP[u.status].label}</span></td>
                  <td style={{fontSize:12.5,color:"var(--adm-text-sub)"}}>{u.joined}</td>
                  <td>
                    {u.reports > 0
                      ? <span className="adm-tag adm-tag--red">{u.reports} lần</span>
                      : <span style={{color:"var(--adm-text-sub)",fontSize:13}}>—</span>
                    }
                  </td>
                  <td>
                    <div className="usr__actions">
                      <button className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--icon" title="Xem chi tiết">
                        <FiEye size={13}/>
                      </button>
                      {u.status === "pending" && u.org && (
                        <button className="adm-btn adm-btn--success adm-btn--sm" onClick={()=>approveOrg(u.id)}>
                          <FiShield size={12}/> Duyệt
                        </button>
                      )}
                      <button
                        className={`adm-btn adm-btn--sm ${u.status==="blocked"?"adm-btn--success":"adm-btn--danger"}`}
                        onClick={()=>toggleBlock(u.id)}
                      >
                        {u.status==="blocked"
                          ? <><FiUserCheck size={12}/> Mở</>
                          : <><FiUserX size={12}/> Khóa</>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}