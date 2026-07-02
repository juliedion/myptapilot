import { useState } from 'react'
import ModuleHeader from '../../components/ModuleHeader'

interface Student {
  id: string
  firstName: string
  lastName: string
  grade: string
  teacher: string
  parentName: string
  parentEmail: string
  parentPhone: string
  notes?: string
}

const SEED_STUDENTS: Student[] = [
  { id: '1', firstName: 'Emma', lastName: 'Thornton', grade: 'K', teacher: 'Ms. Johnson', parentName: 'Rachel Thornton', parentEmail: 'rthornton@email.com', parentPhone: '(518) 555-0142' },
  { id: '2', firstName: 'Liam', lastName: 'Okafor', grade: 'K', teacher: 'Ms. Johnson', parentName: 'David Okafor', parentEmail: 'dokafor@email.com', parentPhone: '(518) 555-0278' },
  { id: '3', firstName: 'Sophia', lastName: 'Martinez', grade: '1', teacher: 'Mr. Patel', parentName: 'Carmen Martinez', parentEmail: 'cmartinez@email.com', parentPhone: '(518) 555-0361' },
  { id: '4', firstName: 'Noah', lastName: 'Chen', grade: '1', teacher: 'Mr. Patel', parentName: 'Grace Chen', parentEmail: 'gchen@email.com', parentPhone: '(518) 555-0419' },
  { id: '5', firstName: 'Ava', lastName: 'Williams', grade: '2', teacher: 'Ms. Rodriguez', parentName: 'Marcus Williams', parentEmail: 'mwilliams@email.com', parentPhone: '(518) 555-0537' },
  { id: '6', firstName: 'Jackson', lastName: 'Kim', grade: '2', teacher: 'Ms. Rodriguez', parentName: 'Susan Kim', parentEmail: 'skim@email.com', parentPhone: '(518) 555-0683' },
  { id: '7', firstName: 'Olivia', lastName: 'Nguyen', grade: '3', teacher: 'Mrs. Kim', parentName: 'Peter Nguyen', parentEmail: 'pnguyen@email.com', parentPhone: '(518) 555-0724' },
  { id: '8', firstName: 'Ethan', lastName: 'Brooks', grade: '3', teacher: 'Mrs. Kim', parentName: 'Diane Brooks', parentEmail: 'dbrooks@email.com', parentPhone: '(518) 555-0815' },
  { id: '9', firstName: 'Isabella', lastName: 'Patel', grade: '4', teacher: 'Mr. Thompson', parentName: 'Raj Patel', parentEmail: 'rpatel@email.com', parentPhone: '(518) 555-0963' },
  { id: '10', firstName: 'Mason', lastName: 'Rivera', grade: '4', teacher: 'Mr. Thompson', parentName: 'Elena Rivera', parentEmail: 'erivera@email.com', parentPhone: '(518) 555-0104' },
  { id: '11', firstName: 'Mia', lastName: 'Johnson', grade: '5', teacher: 'Ms. Williams', parentName: 'Thomas Johnson', parentEmail: 'tjohnson@email.com', parentPhone: '(518) 555-0195' },
  { id: '12', firstName: 'Lucas', lastName: 'Hernandez', grade: '5', teacher: 'Ms. Williams', parentName: 'Maria Hernandez', parentEmail: 'mhernandez@email.com', parentPhone: '(518) 555-0236' },
]

const GRADES = ['K', '1', '2', '3', '4', '5', '6']
const TEACHERS = ['Ms. Johnson', 'Mr. Patel', 'Ms. Rodriguez', 'Mrs. Kim', 'Mr. Thompson', 'Ms. Williams']

const EMPTY_FORM: Omit<Student, 'id'> = {
  firstName: '', lastName: '', grade: 'K', teacher: TEACHERS[0],
  parentName: '', parentEmail: '', parentPhone: '', notes: '',
}

const GRADE_COLORS: Record<string, string> = {
  K: 'bg-violet-100 text-violet-700',
  '1': 'bg-blue-100 text-blue-700',
  '2': 'bg-teal-100 text-teal-700',
  '3': 'bg-green-100 text-green-700',
  '4': 'bg-amber-100 text-amber-700',
  '5': 'bg-orange-100 text-orange-700',
  '6': 'bg-red-100 text-red-700',
}

interface StudentModalProps {
  student?: Student
  onSave: (s: Omit<Student, 'id'>) => void
  onClose: () => void
}

function StudentModal({ student, onSave, onClose }: StudentModalProps) {
  const [form, setForm] = useState<Omit<Student, 'id'>>(
    student ? { firstName: student.firstName, lastName: student.lastName, grade: student.grade, teacher: student.teacher, parentName: student.parentName, parentEmail: student.parentEmail, parentPhone: student.parentPhone, notes: student.notes || '' }
    : { ...EMPTY_FORM }
  )

  const set = (field: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{student ? 'Edit Student' : 'Add Student'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input className="input" required value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input" required value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Grade</label>
              <select className="input" value={form.grade} onChange={e => set('grade', e.target.value)}>
                {GRADES.map(g => <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Teacher</label>
              <select className="input" value={form.teacher} onChange={e => set('teacher', e.target.value)}>
                {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Parent / Guardian Name</label>
            <input className="input" required value={form.parentName} onChange={e => set('parentName', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Parent Email</label>
              <input className="input" type="email" required value={form.parentEmail} onChange={e => set('parentEmail', e.target.value)} />
            </div>
            <div>
              <label className="label">Parent Phone</label>
              <input className="input" type="tel" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} placeholder="(518) 555-0000" />
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Allergies, accommodations, etc." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{student ? 'Save Changes' : 'Add Student'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StudentsModule() {
  const [students, setStudents] = useState<Student[]>(SEED_STUDENTS)
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('All')
  const [modalStudent, setModalStudent] = useState<Student | null | 'new'>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
      || s.parentName.toLowerCase().includes(q)
      || s.teacher.toLowerCase().includes(q)
    const matchGrade = gradeFilter === 'All' || s.grade === gradeFilter
    return matchSearch && matchGrade
  })

  const uniqueGrades = [...new Set(students.map(s => s.grade))].sort((a, b) => {
    const order = ['K', '1', '2', '3', '4', '5', '6']
    return order.indexOf(a) - order.indexOf(b)
  })
  const uniqueTeachers = [...new Set(students.map(s => s.teacher))]

  const handleSave = (form: Omit<Student, 'id'>) => {
    if (modalStudent === 'new') {
      setStudents(prev => [...prev, { ...form, id: Date.now().toString() }])
    } else if (modalStudent) {
      setStudents(prev => prev.map(s => s.id === modalStudent.id ? { ...form, id: s.id } : s))
    }
    setModalStudent(null)
  }

  const handleDelete = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <ModuleHeader
        title="Student Directory"
        subtitle="Manage student and family contact information"
        gradient="gradient-cool"
        icon="🎓"
        actions={
          <button onClick={() => setModalStudent('new')} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl backdrop-blur-sm transition-all">
            + Add Student
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{students.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Total Students</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{uniqueGrades.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Grades Covered</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{uniqueTeachers.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Teachers</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="input pl-9"
              placeholder="Search by student, parent, or teacher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['All', ...GRADES].map(g => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  gradeFilter === g
                    ? 'gradient-vivid text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g === 'All' ? 'All Grades' : g === 'K' ? 'Kindergarten' : `Grade ${g}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grade</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent / Guardian</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">No students found</td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full gradient-cool flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{s.firstName} {s.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${GRADE_COLORS[s.grade] || 'bg-slate-100 text-slate-600'}`}>
                      {s.grade === 'K' ? 'K' : `Gr. ${s.grade}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{s.teacher}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 font-medium">{s.parentName}</td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-slate-600">{s.parentPhone}</p>
                    <p className="text-xs text-slate-400">{s.parentEmail}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setModalStudent(s)}
                        className="btn-secondary text-xs py-1 px-2.5"
                      >
                        Edit
                      </button>
                      <a
                        href={`mailto:${s.parentEmail}`}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors"
                        title={`Email ${s.parentName}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                      {deleteId === s.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(s.id)} className="text-xs text-red-600 font-semibold hover:underline">Confirm</button>
                          <button onClick={() => setDeleteId(null)} className="text-xs text-slate-400 hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                          title="Delete student"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
          Showing {filtered.length} of {students.length} students
        </div>
      </div>

      {modalStudent !== null && (
        <StudentModal
          student={modalStudent === 'new' ? undefined : modalStudent}
          onSave={handleSave}
          onClose={() => setModalStudent(null)}
        />
      )}
    </div>
  )
}
