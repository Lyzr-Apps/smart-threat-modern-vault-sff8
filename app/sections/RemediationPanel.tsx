'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiX,
  FiActivity,
  FiFileText,
  FiShield,
} from 'react-icons/fi'

interface RemediationStep {
  finding_reference: string
  priority: string
  action: string
  detailed_steps: string
  compliance_notes: string
}

interface ComplianceSummary {
  gdpr_relevant: boolean
  hipaa_relevant: boolean
  pci_dss_relevant: boolean
  sox_relevant: boolean
  notes: string
}

interface RemediationPanelProps {
  remediationSteps: RemediationStep[]
  complianceSummary: ComplianceSummary | null
}

function getPriorityColor(priority: string): string {
  const p = (priority ?? '').toLowerCase()
  if (p === 'p0') return 'bg-red-600/20 text-red-300 border-red-600/40'
  if (p === 'p1') return 'bg-orange-600/20 text-orange-300 border-orange-600/40'
  if (p === 'p2') return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/40'
  if (p === 'p3') return 'bg-green-600/20 text-green-300 border-green-600/40'
  return 'bg-slate-600/20 text-slate-300 border-slate-600/40'
}

function getPriorityLabel(priority: string): string {
  const p = (priority ?? '').toUpperCase()
  if (p === 'P0') return 'P0 - Critical'
  if (p === 'P1') return 'P1 - High'
  if (p === 'P2') return 'P2 - Medium'
  if (p === 'P3') return 'P3 - Low'
  return priority ?? 'Unknown'
}

export default function RemediationPanel({ remediationSteps, complianceSummary }: RemediationPanelProps) {
  const steps = Array.isArray(remediationSteps) ? remediationSteps : []
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({})

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const complianceFrameworks = [
    { key: 'gdpr_relevant', label: 'GDPR', desc: 'General Data Protection Regulation' },
    { key: 'hipaa_relevant', label: 'HIPAA', desc: 'Health Insurance Portability and Accountability Act' },
    { key: 'pci_dss_relevant', label: 'PCI-DSS', desc: 'Payment Card Industry Data Security Standard' },
    { key: 'sox_relevant', label: 'SOX', desc: 'Sarbanes-Oxley Act' },
  ]

  return (
    <div className="space-y-5">
      {/* Remediation Steps */}
      <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FiActivity className="h-5 w-5 text-orange-400" />
            Remediation Steps
            <Badge variant="outline" className="ml-2 text-xs bg-slate-800/60 text-slate-300 border-slate-600/40">
              {steps.length} {steps.length === 1 ? 'action' : 'actions'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FiShield className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No remediation steps needed</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <Collapsible key={i} open={!!openItems[i]} onOpenChange={() => toggleItem(i)}>
                    <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 overflow-hidden">
                      <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3 text-left">
                          <Badge variant="outline" className={`text-xs font-mono ${getPriorityColor(step?.priority ?? '')}`}>
                            {step?.priority ?? '?'}
                          </Badge>
                          <span className="text-sm text-slate-200 font-medium">{step?.action ?? 'Unknown action'}</span>
                        </div>
                        {openItems[i] ? (
                          <FiChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <FiChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-3 border-t border-slate-700/30 pt-3">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Finding Reference</p>
                            <p className="text-sm text-cyan-400/90 font-mono">{step?.finding_reference ?? '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Priority</p>
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(step?.priority ?? '')}`}>
                              {getPriorityLabel(step?.priority ?? '')}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Detailed Steps</p>
                            <div className="text-sm text-slate-300 bg-slate-800/60 rounded-md p-3 whitespace-pre-wrap leading-relaxed">
                              {step?.detailed_steps ?? 'No detailed steps provided.'}
                            </div>
                          </div>
                          {(step?.compliance_notes ?? '').length > 0 && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Compliance Notes</p>
                              <div className="text-sm text-yellow-300/80 bg-yellow-950/20 border border-yellow-800/30 rounded-md p-3">
                                <FiFileText className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                                {step.compliance_notes}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Compliance Summary */}
      <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FiFileText className="h-5 w-5 text-blue-400" />
            Compliance Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {complianceFrameworks.map((fw) => {
              const isRelevant = complianceSummary ? !!(complianceSummary as any)?.[fw.key] : false
              return (
                <div
                  key={fw.key}
                  className={`rounded-lg border p-3 text-center transition-all ${isRelevant ? 'border-red-700/50 bg-red-950/20' : 'border-green-800/30 bg-green-950/10'}`}
                >
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 ${isRelevant ? 'bg-red-900/40 text-red-400' : 'bg-green-900/40 text-green-400'}`}>
                    {isRelevant ? <FiX className="h-4 w-4" /> : <FiCheck className="h-4 w-4" />}
                  </div>
                  <p className={`text-sm font-semibold ${isRelevant ? 'text-red-300' : 'text-green-300'}`}>{fw.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{isRelevant ? 'Affected' : 'Not Affected'}</p>
                </div>
              )
            })}
          </div>
          {(complianceSummary?.notes ?? '').length > 0 && (
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Compliance Notes</p>
              <p className="text-sm text-slate-300">{complianceSummary?.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
