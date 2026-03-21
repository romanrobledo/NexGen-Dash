import { useState, useCallback } from 'react'
import { BookOpen, Download, Eye, X, FileText, Briefcase, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const applications = [
  {
    id: 'employee',
    title: 'Employee Application',
    description: 'Application form for prospective NexGen team members.',
    icon: Briefcase,
    color: 'blue',
    file: '/applications/employee-application.pdf',
    filename: 'NexGen Employee Application.pdf',
  },
  {
    id: 'student',
    title: 'Student Application',
    description: 'Enrollment application for new students and families.',
    icon: GraduationCap,
    color: 'purple',
    file: '/applications/student-application.pdf',
    filename: 'NexGen Student Application.pdf',
  },
]

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    btnSecondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    btnPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
    btnSecondary: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200',
  },
}

function PdfViewer({ file, title, filename, onClose }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [containerWidth, setContainerWidth] = useState(null)

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }, [])

  const containerRef = useCallback((node) => {
    if (node) {
      setContainerWidth(node.getBoundingClientRect().width)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={file}
              download={filename}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <Download size={14} />
              Download
            </a>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Page Navigation */}
        {numPages && (
          <div className="flex items-center justify-center gap-4 px-6 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-600">
              Page <span className="font-semibold text-gray-900">{pageNumber}</span> of{' '}
              <span className="font-semibold text-gray-900">{numPages}</span>
            </span>
            <button
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* PDF Content */}
        <div ref={containerRef} className="flex-1 overflow-y-auto bg-gray-100 flex justify-center p-4">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading PDF...</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <FileText size={48} className="text-gray-400" />
                <p className="text-gray-600">PDF not yet available.</p>
                <p className="text-sm text-gray-400">The file will appear here once uploaded.</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={containerWidth ? Math.min(containerWidth - 32, 800) : 700}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  const [viewingPdf, setViewingPdf] = useState(null)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-500 rounded-xl flex items-center justify-center">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-500 text-sm">
              NexGen application forms — click to view or download
            </p>
          </div>
        </div>
      </div>

      {/* Application Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((app) => {
          const colors = colorMap[app.color]
          const Icon = app.icon
          return (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className={`${colors.bg} ${colors.border} border-b p-6`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon size={20} className={colors.iconText} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{app.title}</h2>
                    <p className="text-sm text-gray-600">{app.description}</p>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 flex items-center gap-3">
                <button
                  onClick={() => setViewingPdf(app)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${colors.btnPrimary}`}
                >
                  <Eye size={16} />
                  View PDF
                </button>
                <a
                  href={app.file}
                  download={app.filename}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${colors.btnSecondary}`}
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <PdfViewer
          file={viewingPdf.file}
          title={viewingPdf.title}
          filename={viewingPdf.filename}
          onClose={() => setViewingPdf(null)}
        />
      )}
    </div>
  )
}
