/** Learning progress tracking with subject-wise stats and charts. */
import React from 'react'

export default function MyProgress() {
  const overallProgress = {
    totalCourses: 5,
    completedCourses: 1,
    averageGrade: 87,
    attendanceRate: 92,
    assignmentsCompleted: 8,
    totalAssignments: 12
  }

  const courseProgress = [
    {
      course: 'Mathematics - Calculus',
      progress: 75,
      grade: 88,
      attendance: 95,
      assignments: { completed: 6, total: 8 }
    },
    {
      course: 'Physics - Mechanics',
      progress: 60,
      grade: 85,
      attendance: 90,
      assignments: { completed: 5, total: 7 }
    },
    {
      course: 'Organic Chemistry',
      progress: 85,
      grade: 92,
      attendance: 93,
      assignments: { completed: 7, total: 8 }
    },
    {
      course: 'Computer Science',
      progress: 45,
      grade: 78,
      attendance: 88,
      assignments: { completed: 4, total: 9 }
    },
    {
      course: 'Statistics',
      progress: 100,
      grade: 94,
      attendance: 100,
      assignments: { completed: 6, total: 6 }
    }
  ]

  const recentGrades = [
    { assignment: 'Physics Lab Report', course: 'Physics', grade: 92, maxGrade: 100, date: 'Jan 15, 2026' },
    { assignment: 'Calculus Quiz 3', course: 'Mathematics', grade: 88, maxGrade: 100, date: 'Jan 12, 2026' },
    { assignment: 'Chemistry Problem Set', course: 'Chemistry', grade: 95, maxGrade: 100, date: 'Jan 10, 2026' },
    { assignment: 'Programming Assignment', course: 'Computer Science', grade: 85, maxGrade: 100, date: 'Jan 8, 2026' }
  ]

  const getGradeColor = (grade) => {
    if (grade >= 90) return '#28a745'
    if (grade >= 80) return '#f59e0b'
    if (grade >= 70) return '#ffc107'
    return '#dc3545'
  }

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#28a745'
    if (progress >= 50) return '#f59e0b'
    return '#ffc107'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-normal text-[#0a0b0d]" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>My Progress</h2>
        <p className="text-[#7c828a] text-sm mt-1">Track your academic performance and achievements</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4 border-[#0052ff]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold text-[#0052ff]">
              {overallProgress.completedCourses}/{overallProgress.totalCourses}
            </span>
          </div>
          <p className="text-[#0a0b0d] font-semibold">Courses Progress</p>
          <div className="w-full h-2 bg-[#f7f7f7] rounded-[100px] mt-3 overflow-hidden">
            <div
              className="h-full rounded-[100px] bg-[#0052ff]"
              style={{
                width: `${(overallProgress.completedCourses / overallProgress.totalCourses) * 100}%`
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
              {overallProgress.averageGrade}%
            </span>
          </div>
          <p className="text-[#0a0b0d] font-semibold">Average Grade</p>
          <div className="w-full h-2 bg-[#f7f7f7] rounded-[100px] mt-3 overflow-hidden">
            <div
              className="h-full rounded-[100px]"
              style={{
                width: `${overallProgress.averageGrade}%`,
                backgroundColor: '#f59e0b'
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4" style={{ borderLeftColor: '#28a745' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold" style={{ color: '#28a745' }}>
              {overallProgress.attendanceRate}%
            </span>
          </div>
          <p className="text-[#0a0b0d] font-semibold">Attendance Rate</p>
          <div className="w-full h-2 bg-[#f7f7f7] rounded-[100px] mt-3 overflow-hidden">
            <div
              className="h-full rounded-[100px]"
              style={{
                width: `${overallProgress.attendanceRate}%`,
                backgroundColor: '#28a745'
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4" style={{ borderLeftColor: '#ffc107' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold" style={{ color: '#ffc107' }}>
              {overallProgress.assignmentsCompleted}/{overallProgress.totalAssignments}
            </span>
          </div>
          <p className="text-[#0a0b0d] font-semibold">Assignments Done</p>
          <div className="w-full h-2 bg-[#f7f7f7] rounded-[100px] mt-3 overflow-hidden">
            <div
              className="h-full rounded-[100px]"
              style={{
                width: `${(overallProgress.assignmentsCompleted / overallProgress.totalAssignments) * 100}%`,
                backgroundColor: '#ffc107'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Course-wise Progress */}
      <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6">
        <h3 className="text-base font-semibold text-[#0a0b0d] mb-6">Course-wise Performance</h3>
        <div className="space-y-6">
          {courseProgress.map((course, index) => (
            <div key={index} className="p-4 rounded-[12px] border border-[#dee1e6]">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-[#0a0b0d]">{course.course}</h4>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: getGradeColor(course.grade) }}>
                    {course.grade}%
                  </p>
                  <p className="text-sm text-gray-600">Grade</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[#5b616e]">Course Progress</span>
                    <span className="text-sm font-bold" style={{ color: getProgressColor(course.progress) }}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#f7f7f7] rounded-[100px] overflow-hidden">
                    <div
                      className="h-full rounded-[100px] transition-all"
                      style={{
                        width: `${course.progress}%`,
                        backgroundColor: getProgressColor(course.progress)
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[#5b616e]">Attendance</span>
                    <span className="text-sm font-bold" style={{ color: '#28a745' }}>
                      {course.attendance}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#f7f7f7] rounded-[100px] overflow-hidden">
                    <div
                      className="h-full rounded-[100px] transition-all"
                      style={{
                        width: `${course.attendance}%`,
                        backgroundColor: '#28a745'
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[#5b616e]">Assignments</span>
                    <span className="text-sm font-bold" style={{ color: '#0052ff' }}>
                      {course.assignments.completed}/{course.assignments.total}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#f7f7f7] rounded-[100px] overflow-hidden">
                    <div
                      className="h-full rounded-[100px] transition-all"
                      style={{
                        width: `${(course.assignments.completed / course.assignments.total) * 100}%`,
                        backgroundColor: '#0052ff'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Grades */}
      <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6">
        <h3 className="text-base font-semibold text-[#0a0b0d] mb-6">Recent Grades</h3>
        <div className="space-y-3">
          {recentGrades.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-[12px] flex items-center justify-between border border-[#dee1e6] transition-all"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div className="flex-1">
                <h4 className="font-semibold text-[#0a0b0d]">{item.assignment}</h4>
                <p className="text-sm text-[#5b616e]">{item.course} • {item.date}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: getGradeColor((item.grade / item.maxGrade) * 100) }}>
                  {item.grade}/{item.maxGrade}
                </p>
                <p className="text-sm text-[#5b616e]">
                  {Math.round((item.grade / item.maxGrade) * 100)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  )
}
