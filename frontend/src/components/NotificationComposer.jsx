import {useState} from 'react';
import {api} from '../services/api';
import {Empty,Notice} from './Common';
export default function NotificationComposer({learners,onSent}) {
 const [all,setAll]=useState(false),[ids,setIds]=useState([]),[query,setQuery]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const eligible=learners.filter(u=>u.status==='active');
 return <form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await api('/notifications/send','POST',{all,userIds:ids,message});onSent(r.count);}catch(e){setError(e.message);}finally{setBusy(false);}}}>
 <label className="checkbox-row"><input type="checkbox" checked={all} onChange={e=>setAll(e.target.checked)}/>All assigned active students ({eligible.length})</label>
 {!all&&<><input className="form-input mb-16" aria-label="Find notification recipients" placeholder="Search students" value={query} onChange={e=>setQuery(e.target.value)}/><div className="recipient-list">{eligible.filter(u=>(u.firstName+' '+u.lastName+' '+u.email).toLowerCase().includes(query.toLowerCase())).map(u=><label className="checkbox-row" key={u.id}><input type="checkbox" checked={ids.includes(u.id)} onChange={e=>setIds(e.target.checked?[...ids,u.id]:ids.filter(id=>id!==u.id))}/>{u.firstName} {u.lastName} · {u.email}</label>)}</div></>}
 {!eligible.length&&<Empty>No active students are assigned to you yet.</Empty>}<p className="card-subtitle">{all?eligible.length:ids.length} recipients selected</p>
 <label className="form-label" htmlFor="notification-message">Message</label><textarea id="notification-message" className="form-textarea mb-16" required minLength={3} value={message} onChange={e=>setMessage(e.target.value)}/><Notice error={error}/><button className="btn btn-primary" disabled={busy||!eligible.length||(!all&&!ids.length)}>{busy?'Sending…':'Send notification'}</button></form>;
}
