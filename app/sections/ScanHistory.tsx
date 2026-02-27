'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { FiRefreshCw, FiX, FiShield } from 'react-icons/fi'

interface ScanSummary {
  total_findings: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
}

interface HistoryEntry {
  id: string
  timestamp: string
  riskLevel: string
  totalFindings: number
  data: any
}

interface ScanHistoryProps {
  history: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onClear: () => void
  selectedId: string | null
}

function getRiskBadgeColor(level: string): string {
  const l = (level ?? '').toLowerCase()
  if (l === 'critical') return 'bg-red-600/20 text-red-300 border-red-600/40'
  if (l === 'high') return 'bg-orange-600/20 text-orange-300 border-orange-600/40'
  if (l === 'medium') return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/40'
  if (l === 'low') return 'bg-green-600/20 text-green-300 border-green-600/40'
  if (l === 'clean') return 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40'
  return 'bg-slate-600/20 text-slate-300 border-slate-600/40'
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ts ?? 'Unknown'
  }
}

export default function ScanHistory({ history, onSelect, onClear, selectedId }: ScanHistoryProps) {
  return (
    <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FiRefreshCw className="h-4 w-4 text-slate-400" />
            Scan History
          </CardTitle>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 px-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
            >
              <FiX className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-6 text-slate-600">
            <FiShield className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No scans yet</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-2">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onSelect(entry)}
                  className={`w-full text-left rounded-lg border p-3 transition-all duration-150 hover:bg-slate-800/60 ${selectedId === entry.id ? 'border-cyan-600/50 bg-cyan-950/20' : 'border-slate-700/30 bg-slate-800/20'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className={`text-xs ${getRiskBadgeColor(entry.riskLevel)}`}>
                      {entry.riskLevel ?? 'Unknown'}
                    </Badge>
                    <span className="text-xs text-slate-500">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {entry.totalFindings} {entry.totalFindings === 1 ? 'finding' : 'findings'}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
