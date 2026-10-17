import { useEffect, useRef, useState } from "react";
import { api, money } from "../services/api";
import { useResource } from "../hooks/useResource";
import { Card, Editor, Modal, Table, Empty, Notice } from "./Common";
export function Courses({ user, openSignal = 0, notify }) {
  const r = useResource(
      user.role === "provider" ? "/courses/provider/" + user.id : "/courses",
    ),
    e = useResource(
      user.role === "learner" ? "/enrollments/learner/" + user.id : null,
    ),
    users = useResource(user.role === "superuser" ? "/users" : null),
    [edit, setEdit] = useState(null),
    [seen, setSeen] = useState(openSignal),
    [selected, setSelected] = useState(null);
  if (openSignal !== seen) {
    setSeen(openSignal);
    setEdit({});
  }
  async function run(fn) {
    try {
      await fn();
      r.reload();
      e.reload();
    } catch (e) {
      notify(e.message);
    }
  }
  return (
    <>
      <Notice error={r.error} />
      <div className={user.role === "provider" ? "provider-course-list" : "grid-2"}>
        {r.data
          .filter(
            (c) =>
              user.role !== "learner" ||
              (c.status === "published" &&
                (c.scope !== "ORGANIZATION" ||
                  c.organizationId === user.organizationId)),
          )
          .map((c) => {
            const en = e.data.find((x) => x.courseId === c.id);
            return (
              <Card
                key={c.id}
                title={c.title}
                subtitle={`${c.category} · ${c.accessTier || "FREE"} · ${c.status}`}
              >
                <p>{c.description}</p>
                <p>
                  {c.lessons} lessons · {c.skillPoints} skill points
                </p>
                {user.role === "provider" && <><div className="course-review-badges"><span className="badge badge-gray">Review: {(c.reviewStatus||"DRAFT").replaceAll("_"," ")}</span><span className="badge badge-blue">Quote {money(c.quotedPrice)}</span>{c.adminOffer!==undefined&&<span className="badge badge-orange">Admin offer {money(c.adminOffer)}</span>}</div><div className="course-metrics"><div><strong>{c.enrolledCount||0}</strong><span>Enrolled Students</span></div><div><strong>{c.completedCount||0}</strong><span>Completed</span></div><div><strong>{c.enrolledCount?Math.round(c.completedCount/c.enrolledCount*100):0}%</strong><span>Completion Rate</span></div></div></>}
                {user.role === "learner" ? (
                  <>
                    {en ? (
                      <>
                        <progress
                          value={en.progress}
                          max="100"
                          style={{ width: "100%" }}
                        />
                        <p>{en.progress}% complete</p>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelected(c)}
                        >
                          Open course
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          run(() =>
                            api("/enrollments", "POST", {
                              learnerId: user.id,
                              courseId: c.id,
                            }),
                          )
                        }
                      >
                        Enroll
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelected(c)}
                    >
                      Modules
                    </button>
                    {["provider", "superuser"].includes(user.role) && (
                      <>
                        {" "}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEdit(c)}
                        >
                          Edit
                        </button>{" "}
                        {["draft","rejected"].includes(c.status) && <button
                          className="btn btn-orange btn-sm"
                          onClick={() =>
                            run(() =>
                              api(
                                "/commercial/courses/" +
                                  c.id +
                                  "/submit-review",
                                "POST",
                                { quotedPrice: Number(c.quotedPrice || 0) },
                              ),
                            )
                          }
                        >
                          Submit review
                        </button>}
                        {c.status === "negotiation" && c.adminOffer !== undefined && c.reviewStatus !== "OFFER_ACCEPTED" && (
                          <button
                            className="btn btn-green btn-sm"
                            onClick={() =>
                              run(() =>
                                api(
                                  "/commercial/courses/" +
                                    c.id +
                                    "/accept-offer",
                                  "POST",
                                  {},
                                ),
                              )
                            }
                          >
                            Accept {money(c.adminOffer)}
                          </button>
                        )}{" "}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            if (confirm("Delete course?"))
                              run(() => api("/courses/" + c.id, "DELETE"));
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </>
                )}
              </Card>
            );
          })}
      </div>
      {!r.data.length && <Empty />}
      {edit && (
        <Modal
          title={edit.id ? "Edit Course" : "New Course"}
          onClose={() => setEdit(null)}
        >
          <Editor
            fields={[
              { name: "title" },
              { name: "description", type: "textarea" },
              { name: "category" },
              { name: "lessons", type: "number", min: 1 },
              { name: "duration" },
              { name: "skillPoints", type: "number", min: 1 },
              {
                name: "accessTier",
                label: "Access tier",
                options: ["FREE", "PRO"],
              },
              {
                name: "quotedPrice",
                label: "Provider quote (₹)",
                type: "number",
                min: 0,
              },
              ...(user.role === "superuser"
                ? [
                    {
                      name: "providerId",
                      options: users.data
                        .filter((x) => x.role === "provider")
                        .map((x) => ({
                          value: x.id,
                          label: x.firstName + " " + x.lastName,
                        })),
                    },
                  ]
                : []),
            ]}
            initial={{
              lessons: 1,
              duration: "2 weeks",
              skillPoints: 25,
              accessTier: "FREE",
              quotedPrice: 0,
              ...edit,
            }}
            onSubmit={async (v) => {
              const keys = [
                "title",
                "description",
                "category",
                "lessons",
                "duration",
                "skillPoints",
                "accessTier",
                "quotedPrice",
              ];
              const b = Object.fromEntries(keys.map((k) => [k, v[k]]));
              if (!edit.id) {
                b.providerId =
                  user.role === "provider" ? user.id : v.providerId;
                b.status = "draft";
              }
              await api(
                "/courses" + (edit.id ? "/" + edit.id : ""),
                edit.id ? "PATCH" : "POST",
                b,
              );
              setEdit(null);
              r.reload();
              notify("Course saved.");
            }}
          />
        </Modal>
      )}
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <Modules
            user={user}
            course={selected}
            notify={notify}
            enrollment={e.data.find((x) => x.courseId === selected.id)}
            onProgress={() => e.reload()}
          />
        </Modal>
      )}
    </>
  );
}
export function Modules({ user, course, notify, enrollment, onProgress }) {
  const r = useResource("/courses/" + course.id + "/modules"),
    [create, setCreate] = useState(false), [editModule,setEditModule] = useState(null);
  const editorRef=useRef(null);
  useEffect(()=>{if(editModule){editorRef.current?.scrollIntoView({behavior:"smooth",block:"start"});editorRef.current?.querySelector("input")?.focus({preventScroll:true});}},[editModule]);
  return (
    <>
      <Notice error={r.error} />
      {!r.loading && !r.data.length && <Empty>No lessons yet. Add a module or upload a lesson.</Empty>}
      {editModule && <div ref={editorRef} className="module-editor" style={{scrollMarginTop:100}}><h4>Edit lesson</h4><button className="btn btn-secondary btn-sm" onClick={()=>setEditModule(null)}>Cancel edit</button><Editor key={editModule.id} fields={[{name:"title"},{name:"description",type:"textarea",required:false},{name:"order",type:"number",min:1},{name:"duration",required:false}]} initial={editModule} submit="Save module" onSubmit={async v=>{await api("/course-modules/"+editModule.id,"PATCH",Object.fromEntries(["title","description","order","duration"].filter(k=>v[k]!==undefined).map(k=>[k,v[k]])));setEditModule(null);r.reload();notify("Module updated.");}}/></div>}
      {r.data.map((m) => (
        <Card
          key={m.id}
          title={m.title}
          subtitle={m.type + " · " + (m.duration || "")}
        >
          <p>{m.description}</p>
          {m.url &&
            !m.locked &&
            (m.type === "video" ? (
              <LessonVideo key={m.id} url={m.url} notify={notify} />
            ) : (
              <a href={m.url} target="_blank" rel="noreferrer">
                Open material
              </a>
            ))}
          {m.locked && <p>Pro access required.</p>}
          {enrollment && !m.locked && <button className="btn btn-primary btn-sm" disabled={(enrollment.completedModuleIds||[]).includes(m.id)} onClick={async()=>{try{await api("/enrollments/"+enrollment.id+"/progress","PATCH",{moduleId:m.id});onProgress?.();notify("Lesson completion saved.");}catch(e){notify(e.message);}}}>{(enrollment.completedModuleIds||[]).includes(m.id)?"Completed":"Mark lesson complete"}</button>}

          {["provider", "superuser"].includes(user.role) && (<><button className="btn btn-secondary btn-sm" onClick={()=>setEditModule({...m})}>Edit module</button>{" "}
            <button
              className="btn btn-secondary btn-sm"
              onClick={async () => {
                try {
                  await api("/course-modules/" + m.id, "DELETE");
                  r.reload();
                } catch (e) {
                  notify(e.message);
                }
              }}
            >
              Remove module
            </button></>
          )}
        </Card>
      ))}
      {enrollment && <p className="card-subtitle">{enrollment.progress || 0}% complete · {(enrollment.completedModuleIds || []).length} lessons completed</p>}
      {["provider", "superuser"].includes(user.role) && (
        <button className="btn btn-primary" onClick={() => setCreate(!create)}>
          + Add module
        </button>
      )}
      {create && (
        <Editor
          fields={[
            { name: "title" },
            { name: "type", options: ["video", "document", "text", "quiz"] },
            { name: "order", type: "number", min: 1 },
            { name: "url", label: "Material URL", required: false },
            { name: "description", type: "textarea", required:false },
          ]}
          initial={{ order: r.data.length + 1, type: "text" }}
          onSubmit={async (v) => {
            await api(
              "/courses/" + course.id + "/modules",
              "POST",
              Object.fromEntries(Object.entries(v).filter(([, v]) => v !== "")),
            );
            setCreate(false);
            r.reload();
          }}
        />
      )}
    </>
  );
}
export function Quizzes({ user, openSignal = 0, notify }) {
 const r=useResource('/quizzes',[],5000),courses=useResource('/courses');
 const [edit,setEdit]=useState(null),[seen,setSeen]=useState(openSignal),[take,setTake]=useState(null),[answers,setAnswers]=useState({}),[submission,setSubmission]=useState(''),[review,setReview]=useState(null),[busy,setBusy]=useState(false);
 useEffect(()=>{if(review){const fresh=r.data.find(q=>q.id===review.id);if(fresh)setReview(fresh);}},[r.data]);
 if(openSignal!==seen){setSeen(openSignal);setEdit({});}
 async function run(fn){setBusy(true);try{await fn();}catch(e){notify(e.message);}finally{setBusy(false);}}
 return <><Notice error={r.error}/><Table heads={['Quiz','Questions / Format','Access','Results','Action']} rows={r.data.map(q=>{
  const graded=(q.attempts||[]).filter(a=>typeof a.score==='number'),pending=(q.attempts||[]).filter(a=>a.status==='PENDING_REVIEW');
  const average=graded.length?Math.round(graded.reduce((n,a)=>n+a.score/a.total*100,0)/graded.length):null;
  const latest=(q.attempts||[]).at(-1);
  return [q.title,q.kind==='PDF'?'PDF question paper':(q.questions||[]).length,q.accessTier||courses.data.find(c=>c.id===q.courseId)?.accessTier||'FREE',user.role==='learner'&&latest?(latest.status==='PENDING_REVIEW'?'Awaiting review':`${latest.score}/${latest.total}${latest.feedback?' · '+latest.feedback:''}`):`${graded.length} graded${average!==null?' · '+average+'% average':''}${pending.length?' · '+pending.length+' awaiting review':''}`,
   user.role==='learner'?<button className="btn btn-primary btn-sm" disabled={busy} onClick={()=>run(async()=>{const fresh=await api('/quizzes/'+q.id);setTake(fresh);setAnswers({});setSubmission('');})}>Take quiz</button>:<div className="flex-center gap-12"><button className="btn btn-secondary btn-sm" onClick={()=>setEdit(q)}>Edit</button>{q.kind==='PDF'&&<button className="btn btn-secondary btn-sm" onClick={()=>run(async()=>setReview(await api('/quizzes/'+q.id)))}>Review submissions</button>}</div>];
 })}/>
 {take&&<Modal title={take.title} onClose={()=>setTake(null)}><form onSubmit={e=>{e.preventDefault();run(async()=>{
   const result=await api('/quizzes/'+take.id+'/submit','POST',{learnerId:user.id,...(take.kind==='PDF'?{submissionText:submission}:{answers:take.questions.map((_,i)=>answers[i]??-1)})});
   notify(result.status==='PENDING_REVIEW'?'PDF quiz submitted. Your provider will review your answers.':`Score: ${result.score}/${result.total}${result.passed?' — Passed':' — Try again'}`);setTake(null);r.reload();
 })}}>
  {take.kind==='PDF'?<><p className="mb-16">{take.instructions||'Read the PDF and submit your answers below.'}</p>{take.pdfUrl?<a className="btn btn-secondary mb-16" href={take.pdfUrl} target="_blank" rel="noreferrer">Open quiz PDF</a>:<p className="alert alert-red">Enroll in this published course and obtain the required access before opening its question paper.</p>}<label className="form-label" htmlFor="pdf-quiz-answer">Your answers</label><textarea id="pdf-quiz-answer" className="form-textarea mb-16" rows={10} required minLength={3} value={submission} onChange={e=>setSubmission(e.target.value)}/><p className="card-subtitle">PDF answers are reviewed by the quiz creator and scored out of 100.</p></>:take.questions.map((q,i)=><div className="form-group" key={i}><p>{i+1}. {q.q}</p>{q.options.map((o,j)=><label className="checkbox-row" key={j}><input type="radio" name={'answer'+i} checked={answers[i]===j} onChange={()=>setAnswers({...answers,[i]:j})}/>{o}</label>)}</div>)}
  <button className="btn btn-primary" disabled={busy||(take.kind==='PDF'?!take.pdfUrl:take.questions.some((_,i)=>answers[i]===undefined))}>{busy?'Submitting…':'Submit answers'}</button>
 </form></Modal>}
 {edit&&<Modal title="Quiz editor" onClose={()=>setEdit(null)}><QuizEditor initial={edit} courses={courses.data.filter(c=>user.role!=='provider'||c.providerId===user.id)} onSubmit={async(values,file)=>{
  if(file){const form=new FormData();form.append('pdf',file);for(const k of ['title','courseId','status','instructions'])form.append(k,values[k]||'');if(edit.id)form.append('quizId',edit.id);await api('/quizzes/upload-pdf','POST',form);}
  else await api('/quizzes'+(edit.id?'/'+edit.id:''),edit.id?'PATCH':'POST',{...values,...(!edit.id?{providerId:user.id}:{})});
  r.reload();setEdit(null);notify('Quiz saved.');
 }}/>{edit.id&&<button className="btn btn-secondary mt-16" onClick={()=>run(async()=>{if(!confirm('Delete this quiz?'))return;await api('/quizzes/'+edit.id,'DELETE');setEdit(null);r.reload();notify('Quiz deleted.');})}>Delete quiz</button>}</Modal>}
 {review&&<Modal title={'Review: '+review.title} onClose={()=>setReview(null)}>{!(review.attempts||[]).length&&<Empty>No submissions yet.</Empty>}{(review.attempts||[]).map(a=><Card key={a.id} title={'Learner '+a.learnerId} subtitle={a.status==='GRADED'?`Graded: ${a.score}/${a.total}`:'Awaiting review'}><p style={{whiteSpace:'pre-wrap',marginBottom:16}}>{a.submissionText}</p><Editor fields={[{name:'score',label:'Score (out of 100)',type:'number',min:0,max:100},{name:'feedback',type:'textarea',required:false}]} initial={{score:a.score??0,feedback:a.feedback||''}} submit="Save grade" onSubmit={async values=>{await api(`/quizzes/${review.id}/attempts/${a.id}/grade`,'POST',values);setReview(await api('/quizzes/'+review.id));r.reload();notify('Grade saved and learner notified.');}}/></Card>)}</Modal>}
 </>;
}
export function Uploads({ user, type, notify }) {
  const courses = useResource("/courses/provider/" + user.id);
  const [courseId, setCourse] = useState(""), [file,setFile] = useState(null), [title,setTitle] = useState(""), [description,setDescription] = useState("");
  const [after,setAfter] = useState(""), [busy,setBusy] = useState(false), [error,setError] = useState("");
  const input = useRef(null), modules = useResource(courseId ? "/courses/"+courseId+"/modules" : null);
  const video = type === "video";
  function choose(f) {
    setError(""); if (!f) return;
    if (!(video ? /\.(mp4|webm|mov|mkv|avi)$/i : /\.pdf$/i).test(f.name)) { setError(video ? "Choose an MP4, WEBM, MOV, MKV or AVI video." : "Choose a PDF document."); return; }
    if (f.size > (video ? 500 : 25)*1024*1024) { setError(`Maximum file size is ${video ? 500 : 25} MB.`); return; }
    if (!f.size) { setError("This file is empty."); return; }
    setFile(f); setTitle(f.name.replace(/\.[^.]+$/, ""));
  }
  return <>
    <div className="flex-between mb-16"><div><h3 className="page-title">{video ? "Video Library" : "Learning Materials"}</h3><p className="page-subtitle">Upload lessons to a course so enrolled learners can access them</p></div><button className="btn btn-orange" onClick={()=>input.current?.click()}>+ Upload {video ? "Video" : "PDF"}</button></div>
    <Notice error={error || courses.error || modules.error}/>
    <label className="form-label" htmlFor={"upload-course-"+type}>Course</label>
    <select id={"upload-course-"+type} className="form-select mb-16" value={courseId} onChange={e=>{setCourse(e.target.value);setAfter("");}}><option value="">Choose course</option>{courses.data.map(c=><option key={c.id} value={c.id}>{c.title} · {c.status}</option>)}</select>
    {!courses.loading && !courses.data.length && <p>Create a course in the Courses tab first.</p>}
    <input ref={input} type="file" aria-label={"Upload "+type} accept={video ? ".mp4,.webm,.mov,.mkv,.avi" : ".pdf"} onChange={e=>choose(e.target.files[0])} hidden/>
    <div role="button" tabIndex={0} aria-label={"Choose or drop "+type} className="upload-drop-zone" onClick={()=>input.current?.click()} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();input.current?.click();}}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files[0]);}}><strong>{file ? file.name : "Click to Upload or Drag & Drop"}</strong><p>{file ? (file.size/1024/1024).toFixed(2)+" MB selected" : video ? "MP4, WEBM, MOV, AVI, MKV — Max 500 MB" : "PDF — Max 25 MB"}</p></div>
    {video && <p className="card-subtitle">MP4 (H.264/AAC) and WebM provide the widest browser playback support. Other containers may require conversion.</p>}
    <form onSubmit={async e=>{
      e.preventDefault(); if(!file || !courseId || busy)return;
      setBusy(true);setError("");
      try {
        const data = new FormData(); data.append(video?"video":"pdf",file); data.append("courseId",courseId);data.append("title",title.trim());data.append("description",description);
        if(after && video)data.append("afterModuleId",after);
        await api("/course-modules/upload-"+type,"POST",data);
        setFile(null);setTitle("");setDescription("");setAfter("");if(input.current)input.current.value="";
        modules.reload(); notify("Upload complete. The lesson is available in this course. Publish the course through review for learner access.");
      } catch(e){setError(e.message);} finally{setBusy(false);}
    }}>
      <label className="form-label" htmlFor={"upload-title-"+type}>Lesson title</label><input id={"upload-title-"+type} className="form-input mb-16" minLength={3} required value={title} onChange={e=>setTitle(e.target.value)}/>
      <label className="form-label" htmlFor={"upload-description-"+type}>Description (optional)</label><textarea id={"upload-description-"+type} className="form-textarea mb-16" value={description} onChange={e=>setDescription(e.target.value)}/>
      {video && <><label className="form-label" htmlFor="upload-placement">Place lesson after</label><select id="upload-placement" className="form-select mb-16" value={after} onChange={e=>setAfter(e.target.value)}><option value="">Append to the end</option>{modules.data.map(m=><option key={m.id} value={m.id}>{m.order}. {m.title}</option>)}</select></>}
      <button className="btn btn-orange" disabled={!file || !courseId || busy}>{busy ? "Uploading… Please wait" : "Upload "+(video?"video":"PDF")}</button>
    </form>
    {courseId && <div className="mt-16"><Modules key={courseId} user={user} course={{id:courseId}} notify={notify}/></div>}
  </>;
}

function QuizEditor({initial,courses,onSubmit}) {
 const [title,setTitle]=useState(initial.title||''),[courseId,setCourseId]=useState(initial.courseId||''),[status,setStatus]=useState(initial.status||'active'),[kind,setKind]=useState(initial.kind||'MCQ'),[file,setFile]=useState(null),[instructions,setInstructions]=useState(initial.instructions||'');
 const [questions,setQuestions]=useState(initial.questions?.length?initial.questions:[{q:'',options:['',''],ans:0}]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const update=(i,patch)=>setQuestions(questions.map((q,j)=>i===j?{...q,...patch}:q));
 return <form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{
  if(kind==='PDF'&&!file&&!initial.pdfUrl)throw Error('Upload your PDF question paper.');
  if(file&&(file.size>25*1024*1024||!file.name.toLowerCase().endsWith('.pdf')))throw Error('Choose a PDF under 25 MB.');
  await onSubmit({title,courseId,status,...(kind==='PDF'?{instructions}:{questions})},kind==='PDF'?file:null);
 }catch(e){setError(e.message);}finally{setBusy(false);}}}>
  <label className="form-label" htmlFor="quiz-format">Quiz format</label><select id="quiz-format" className="form-select mb-16" value={kind} disabled={!!initial.id} onChange={e=>setKind(e.target.value)}><option value="MCQ">Multiple choice questions</option><option value="PDF">Upload PDF question paper</option></select>
  <label className="form-label" htmlFor="quiz-title">Quiz title</label><input id="quiz-title" className="form-input mb-16" required minLength={3} value={title} onChange={e=>setTitle(e.target.value)}/>
  <label className="form-label" htmlFor="quiz-course">Course</label><select id="quiz-course" className="form-select mb-16" required value={courseId} onChange={e=>setCourseId(e.target.value)}><option value="">Choose course</option>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select>
  <label className="form-label" htmlFor="quiz-status">Status</label><select id="quiz-status" className="form-select mb-16" value={status} onChange={e=>setStatus(e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select>
  {kind==='PDF'?<><label className="form-label" htmlFor="quiz-pdf">PDF question paper (maximum 25 MB)</label><input id="quiz-pdf" type="file" accept=".pdf,application/pdf" required={!initial.pdfUrl} disabled={!!initial.attempts?.length} onChange={e=>setFile(e.target.files[0]||null)}/>{initial.pdfUrl&&<p><a href={initial.pdfUrl} target="_blank" rel="noreferrer">Open current question paper</a></p>}<label className="form-label mt-16" htmlFor="quiz-instructions">Instructions</label><textarea id="quiz-instructions" className="form-textarea mb-16" value={instructions} onChange={e=>setInstructions(e.target.value)}/><p className="card-subtitle mb-16">Learners read the PDF and submit written answers. You review and grade submissions out of 100. Uploaded PDFs are not automatically converted into MCQs.</p></>:<>
   {questions.map((q,i)=><fieldset className="quiz-question" key={i}><legend>Question {i+1}</legend><input aria-label={'Question '+(i+1)} className="form-input mb-16" required value={q.q} onChange={e=>update(i,{q:e.target.value})}/>{q.options.map((o,j)=><div className="quiz-option" key={j}><input aria-label={`Correct option ${j+1} for question ${i+1}`} type="radio" name={'correct-'+i} checked={q.ans===j} onChange={()=>update(i,{ans:j})}/><input aria-label={`Option ${j+1} for question ${i+1}`} className="form-input" required value={o} onChange={e=>update(i,{options:q.options.map((v,k)=>k===j?e.target.value:v)})}/>{q.options.length>2&&<button type="button" className="btn btn-secondary btn-sm" onClick={()=>update(i,{options:q.options.filter((_,k)=>k!==j),ans:q.ans===j?0:q.ans>j?q.ans-1:q.ans})}>Remove</button>}</div>)}<p className="card-subtitle">Select the radio button beside the correct answer.</p><button type="button" className="btn btn-secondary btn-sm" disabled={q.options.length>=6} onClick={()=>update(i,{options:[...q.options,'']})}>+ Add option</button>{' '}<button type="button" className="btn btn-secondary btn-sm" disabled={questions.length===1} onClick={()=>setQuestions(questions.filter((_,j)=>i!==j))}>Remove question</button></fieldset>)}
   <button type="button" className="btn btn-secondary mb-16" disabled={questions.length>=50} onClick={()=>setQuestions([...questions,{q:'',options:['',''],ans:0}])}>+ Add question</button>
  </>}
  <Notice error={error}/><button className="btn btn-orange" disabled={busy}>{busy?'Saving…':'Save quiz'}</button>
 </form>;
}

// Keep playing videos stable while resource polling renews signed media links.
function LessonVideo({url,notify}) {
  const [source,setSource]=useState(url), position=useRef(0), playing=useRef(false);
  return <video controls preload="metadata" src={source} style={{width:"100%"}}
    onTimeUpdate={e=>{if(e.currentTarget.readyState>=2)position.current=e.currentTarget.currentTime;}}
    onPlay={()=>{playing.current=true;}}
    onPause={e=>{if(!e.currentTarget.error)playing.current=false;}}
    onLoadedMetadata={e=>{const video=e.currentTarget;if(position.current>0)video.currentTime=Math.min(position.current,video.duration||position.current);if(playing.current)video.play().catch(()=>{});}}
    onError={()=>{if(source!==url)setSource(url);else notify("This browser could not play the video. Reopen the course to renew its link, or use an MP4 (H.264/AAC) or WebM upload.");}} />;
}
