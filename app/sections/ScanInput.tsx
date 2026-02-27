'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FiSearch, FiCode, FiGithub, FiAlertCircle } from 'react-icons/fi'

interface ScanInputProps {
  codeContent: string
  setCodeContent: (val: string) => void
  repoUrl: string
  setRepoUrl: (val: string) => void
  loading: boolean
  error: string | null
  onScan: () => void
}

export default function ScanInput({
  codeContent,
  setCodeContent,
  repoUrl,
  setRepoUrl,
  loading,
  error,
  onScan,
}: ScanInputProps) {
  const canScan = (codeContent.trim().length > 0 || repoUrl.trim().length > 0) && !loading

  return (
    <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <FiCode className="h-5 w-5 text-cyan-400" />
          Security Scan Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="repo-url" className="text-sm text-slate-300 flex items-center gap-2">
            <FiGithub className="h-4 w-4" />
            Repository URL (optional)
          </Label>
          <Input
            id="repo-url"
            placeholder="https://github.com/user/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={loading}
            className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code-content" className="text-sm text-slate-300 flex items-center gap-2">
            <FiCode className="h-4 w-4" />
            Code Content
          </Label>
          <Textarea
            id="code-content"
            placeholder="Paste your code here for security scanning...&#10;&#10;Example:&#10;const API_KEY = 'sk-live-abc123...';&#10;const db_password = 'admin123';&#10;const user_email = 'john@example.com';"
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            disabled={loading}
            rows={12}
            className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 font-mono text-sm resize-y min-h-[200px]"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/50">
            <FiAlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <Button
          onClick={onScan}
          disabled={!canScan}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 h-12 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning for threats...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FiSearch className="h-5 w-5" />
              Run Security Scan
            </span>
          )}
        </Button>

        {loading && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 bg-slate-700/60 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <span className="text-xs text-slate-400">Analyzing...</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2 p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs text-slate-400">Secret Scanner</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs text-slate-400">PII Detector</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-slate-400">Remediation</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
