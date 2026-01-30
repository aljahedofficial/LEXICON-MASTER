'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table'
import { Spinner } from '@/components/Loading'
import { ThemeToggle } from '@/components/ThemeToggle'
import { KPICard, KPIGrid } from '@/components/KPICard'
import { VocabularyTable, type VocabularyFilters } from '@/components/VocabularyTable'
import { ChartControls } from '@/components/ChartControls'
import {
  CumulativeVocabularyStackedChart,
  DifficultySpectrumChart,
  FrequencyDistributionChart,
  FrequencyHistogramChart,
  PartOfSpeechChart,
  VocabularyGrowthChart,
  WordFrequencyBarChart,
  WordLengthHistogramChart,
  LanguageDistributionChart,
  VocabularyTierChart,
  ZipfianDistributionChart,
} from '@/components/Charts'
import type { NetworkLink, NetworkNode } from '@/components/WordNetworkGraph'
import {
  calculateMetrics,
  calculateComplexityMetrics,
  getCumulativeVocabularyStacked,
  getDifficultySpectrum,
  getFrequencyHistogram,
  getFrequencyDistribution,
  getLanguageDistribution,
  getPartOfSpeechDistribution,
  getTopWordFrequencies,
  getVocabularyGrowthCurve,
  getWordLengthDistribution,
  getVocabularyTierDistribution,
  getZipfianData,
  formatMetric,
  type WordFrequencyData,
} from '@/lib/analytics'

const WordNetworkGraph = dynamic(
  () => import('@/components/WordNetworkGraph').then((mod) => mod.WordNetworkGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 text-gray-500">Loading network graph...</div>
    ),
  }
)

interface ProjectFile {
  id: string
  originalName: string
  fileType: string
  fileSize: number
  processingStatus: string
  createdAt: string
}

interface ProjectWord {
  id: string
  word: string
  frequency: number
  wordLength: number
  language?: string
}

interface ProjectDetail {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  files: ProjectFile[]
  words: ProjectWord[]
  _count: {
    files: number
    words: number
  }
}

type TabType = 'overview' | 'vocabulary' | 'analytics' | 'enrichment'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [token, setToken] = useState<string | null>(null)
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Analytics data
  const [metrics, setMetrics] = useState<ReturnType<typeof calculateMetrics> | null>(null)
  const [complexityMetrics, setComplexityMetrics] = useState<ReturnType<typeof calculateComplexityMetrics> | null>(null)
  const [frequencyDistribution, setFrequencyDistribution] = useState<Array<{ frequency: number; count: number }> | null>(null)
  const [frequencyHistogram, setFrequencyHistogram] = useState<Array<{ range: string; count: number; mid: number }> | null>(null)
  const [topWordFrequencies, setTopWordFrequencies] = useState<Array<{ word: string; frequency: number }> | null>(null)
  const [growthCurve, setGrowthCurve] = useState<Array<{ fileIndex: number; uniqueWords: number }> | null>(null)
  const [lengthDistribution, setLengthDistribution] = useState<Array<{ length: number; count: number }> | null>(null)
  const [languageDistribution, setLanguageDistribution] = useState<Array<{ language: string; count: number }> | null>(null)
  const [tierDistribution, setTierDistribution] = useState<Array<{ tier: string; count: number }> | null>(null)
  const [posDistribution, setPosDistribution] = useState<Array<{ partOfSpeech: string; count: number }> | null>(null)
  const [difficultySpectrum, setDifficultySpectrum] = useState<Array<{ level: string; count: number }> | null>(null)
  const [zipfianData, setZipfianData] = useState<Array<{ word: string; frequency: number; rank: number }> | null>(null)
  const [cumulativeStacked, setCumulativeStacked] = useState<Array<Record<string, number>> | null>(null)
  const [vocabFilters, setVocabFilters] = useState<VocabularyFilters>({ query: '' })
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  const frequencyChartRef = useRef<HTMLDivElement>(null)
  const histogramChartRef = useRef<HTMLDivElement>(null)
  const distributionChartRef = useRef<HTMLDivElement>(null)
  const growthChartRef = useRef<HTMLDivElement>(null)
  const lengthChartRef = useRef<HTMLDivElement>(null)
  const languageChartRef = useRef<HTMLDivElement>(null)
  const tierChartRef = useRef<HTMLDivElement>(null)
  const posChartRef = useRef<HTMLDivElement>(null)
  const difficultyChartRef = useRef<HTMLDivElement>(null)
  const zipfChartRef = useRef<HTMLDivElement>(null)
  const cumulativeChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      router.push('/auth/login')
      return
    }
    setToken(storedToken)
  }, [router])

  useEffect(() => {
    if (!token || !params?.id) return

    const fetchProject = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/projects/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch project')
        }

        const data = await res.json()
        setProject(data)

        // Calculate analytics
        if (data.words && data.words.length > 0) {
          const wordData: WordFrequencyData[] = data.words.map((w: ProjectWord) => ({
            word: w.word,
            frequency: w.frequency,
            wordLength: w.wordLength,
            language: w.language,
          }))

          const fileCount = data.files?.length || 0

          setMetrics(calculateMetrics(wordData))
          setComplexityMetrics(calculateComplexityMetrics(wordData))
          setFrequencyDistribution(getFrequencyDistribution(wordData))
          setFrequencyHistogram(getFrequencyHistogram(wordData))
          setTopWordFrequencies(getTopWordFrequencies(wordData, 30))
          setGrowthCurve(getVocabularyGrowthCurve(wordData, fileCount))
          setLengthDistribution(getWordLengthDistribution(wordData))
          setLanguageDistribution(getLanguageDistribution(wordData))
          setTierDistribution(getVocabularyTierDistribution(wordData))
          setPosDistribution(getPartOfSpeechDistribution(wordData))
          setDifficultySpectrum(getDifficultySpectrum(wordData))
          setZipfianData(getZipfianData(wordData))
          setCumulativeStacked(getCumulativeVocabularyStacked(wordData, fileCount))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [token, params?.id])

  const handleChartFilter = (next: Partial<VocabularyFilters>) => {
    setVocabFilters((prev) => ({
      query: next.query ?? prev.query,
      frequency: next.frequency ?? prev.frequency,
      length: next.length ?? prev.length,
      language: next.language ?? prev.language,
    }))
    setActiveTab('vocabulary')
  }

  const fileKeys = useMemo(() => {
    const count = project?.files?.length || 0
    return Array.from({ length: count }, (_, index) => `file_${index + 1}`)
  }, [project?.files?.length])

  const networkData = useMemo(() => {
    if (!project?.words || project.words.length === 0) {
      return { nodes: [], links: [] }
    }

    const topWords = [...project.words]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 40)

    const nodes: NetworkNode[] = topWords.map((word) => ({
      id: word.id,
      label: word.word,
      group: word.wordLength > 8 ? 'adjective' : word.wordLength > 5 ? 'noun' : 'verb',
      size: Math.min(18, Math.max(6, Math.round(word.frequency / 2))),
    }))

    const links: NetworkLink[] = []
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < Math.min(nodes.length, i + 4); j += 1) {
        links.push({
          source: nodes[i].id,
          target: nodes[j].id,
          value: 1,
        })
      }
    }

    return { nodes, links }
  }, [project?.words])

  const frequencyPercentiles = useMemo(() => {
    if (!project?.words || project.words.length === 0) {
      return null
    }
    const freqs = project.words.map((w) => w.frequency).sort((a, b) => a - b)
    const percentile = (p: number) => freqs[Math.floor((p / 100) * (freqs.length - 1))] ?? 0
    return {
      p10: percentile(10),
      p25: percentile(25),
      p50: percentile(50),
      p75: percentile(75),
      p90: percentile(90),
    }
  }, [project?.words])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '📚' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'enrichment', label: 'Enrichment', icon: '✨' },
  ]

  return (
    <DashboardLayout
      rightContent={
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={() => router.push('/dashboard/extraction')}>
            New Extraction
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">❌ {error}</p>
          </div>
        )}

        {project && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {project.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {project.description || 'No description provided'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="primary"
                  onClick={() => router.push(`/dashboard/export/${project.id}`)}
                >
                  📥 Export
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard/projects')}>
                  Back to Projects
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <KPIGrid>
                  <KPICard
                    title="Total Words"
                    value={metrics?.totalWords || 0}
                    subtitle="Unique vocabulary"
                    icon="📖"
                    variant="primary"
                  />
                  <KPICard
                    title="Unique Words"
                    value={metrics?.totalUniqueWords || 0}
                    subtitle="Different words"
                    icon="🔤"
                    variant="secondary"
                  />
                  <KPICard
                    title="Avg Frequency"
                    value={formatMetric(metrics?.averageFrequency || 0, 'decimal')}
                    subtitle="Per word"
                    icon="📊"
                    variant="success"
                  />
                  <KPICard
                    title="Avg Length"
                    value={formatMetric(metrics?.averageWordLength || 0, 'decimal')}
                    subtitle="Characters"
                    icon="📏"
                    variant="warning"
                  />
                </KPIGrid>

                {/* Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card variant="elevated">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Files Uploaded</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {project._count.files}
                      </p>
                    </CardContent>
                  </Card>
                  <Card variant="elevated">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        {project.status}
                      </p>
                    </CardContent>
                  </Card>
                  <Card variant="elevated">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Frequency Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {topWordFrequencies && topWordFrequencies.length > 0 && (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Top Word Frequencies</CardTitle>
                        <CardDescription>Most frequent words (click to filter)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div ref={frequencyChartRef}>
                          <WordFrequencyBarChart
                            data={topWordFrequencies}
                            animationEnabled={animationsEnabled}
                            onSelectWord={(word) => handleChartFilter({ query: word })}
                          />
                        </div>
                        <div className="mt-4">
                          <ChartControls
                            containerRef={frequencyChartRef}
                            fileBaseName="top-word-frequencies"
                            csvData={topWordFrequencies}
                            animationEnabled={animationsEnabled}
                            onToggleAnimation={() => setAnimationsEnabled((prev) => !prev)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {frequencyHistogram && frequencyHistogram.length > 0 && (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Frequency Histogram</CardTitle>
                        <CardDescription>Distribution of word frequencies (click to filter)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div ref={histogramChartRef}>
                          <FrequencyHistogramChart
                            data={frequencyHistogram}
                            animationEnabled={animationsEnabled}
                            onSelectRange={(min, max) => handleChartFilter({ frequency: { min, max } })}
                          />
                        </div>
                        <div className="mt-4">
                          <ChartControls
                            containerRef={histogramChartRef}
                            fileBaseName="frequency-histogram"
                            csvData={frequencyHistogram}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {frequencyDistribution && frequencyDistribution.length > 0 && (
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Word Frequency Distribution</CardTitle>
                      <CardDescription>How frequently words appear in your vocabulary</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div ref={distributionChartRef}>
                        <FrequencyDistributionChart
                          data={frequencyDistribution}
                          animationEnabled={animationsEnabled}
                          onSelectRange={(min, max) => handleChartFilter({ frequency: { min, max } })}
                        />
                      </div>
                      <div className="mt-4">
                        <ChartControls
                          containerRef={distributionChartRef}
                          fileBaseName="frequency-distribution"
                          csvData={frequencyDistribution}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Files Table */}
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Uploaded Files</CardTitle>
                    <CardDescription>Processing status for each file</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {project.files.length === 0 ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">No files uploaded.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {project.files.map((file) => (
                            <TableRow key={file.id}>
                              <TableCell>{file.originalName}</TableCell>
                              <TableCell>{file.fileType || 'unknown'}</TableCell>
                              <TableCell>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</TableCell>
                              <TableCell>
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {file.processingStatus}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'vocabulary' && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Vocabulary List</CardTitle>
                  <CardDescription>All extracted words with frequency and length analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <VocabularyTable
                    words={project.words.map((w) => ({
                      id: w.id,
                      word: w.word,
                      frequency: w.frequency,
                      wordLength: w.wordLength,
                      language: w.language,
                    }))}
                    filters={vocabFilters}
                    onFiltersChange={setVocabFilters}
                  />
                </CardContent>
              </Card>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Complexity Metrics */}
                <KPIGrid>
                  <KPICard
                    title="Lexical Diversity"
                    value={formatMetric(complexityMetrics?.lexicalDiversity || 0, 'decimal')}
                    subtitle="Vocabulary richness"
                    icon="🎯"
                    variant="primary"
                  />
                  <KPICard
                    title="Type-Token Ratio"
                    value={formatMetric(complexityMetrics?.typeTokenRatio || 0, 'decimal')}
                    subtitle="Uniqueness"
                    icon="✓"
                    variant="secondary"
                  />
                  <KPICard
                    title="Simpson's Index"
                    value={formatMetric(complexityMetrics?.simpsonsDiversityIndex || 0, 'decimal')}
                    subtitle="Diversity measure"
                    icon="📊"
                    variant="success"
                  />
                  <KPICard
                    title="Hapax Legomena"
                    value={complexityMetrics?.hapaxLegomena || 0}
                    subtitle="Words appearing once"
                    icon="🔍"
                    variant="warning"
                  />
                </KPIGrid>

                {/* Growth Curve */}
                {growthCurve && growthCurve.length > 0 && (
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Vocabulary Growth Curve</CardTitle>
                      <CardDescription>Cumulative unique words across files</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div ref={growthChartRef}>
                        <VocabularyGrowthChart data={growthCurve} animationEnabled={animationsEnabled} />
                      </div>
                      <div className="mt-4">
                        <ChartControls
                          containerRef={growthChartRef}
                          fileBaseName="vocabulary-growth"
                          csvData={growthCurve}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Distribution Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {lengthDistribution && lengthDistribution.length > 0 && (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Word Length Histogram</CardTitle>
                        <CardDescription>Character count distribution (click to filter)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div ref={lengthChartRef}>
                          <WordLengthHistogramChart
                            data={lengthDistribution}
                            animationEnabled={animationsEnabled}
                            onSelectLength={(length) => handleChartFilter({ length: { min: length, max: length } })}
                          />
                        </div>
                        <div className="mt-4">
                          <ChartControls
                            containerRef={lengthChartRef}
                            fileBaseName="word-length-histogram"
                            csvData={lengthDistribution}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {languageDistribution && languageDistribution.length > 0 && (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Language Distribution</CardTitle>
                        <CardDescription>Words by detected language (click to filter)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div ref={languageChartRef}>
                          <LanguageDistributionChart
                            data={languageDistribution}
                            animationEnabled={animationsEnabled}
                            onSelectLanguage={(language) => handleChartFilter({ language })}
                          />
                        </div>
                        <div className="mt-4">
                          <ChartControls
                            containerRef={languageChartRef}
                            fileBaseName="language-distribution"
                            csvData={languageDistribution}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {tierDistribution && tierDistribution.length > 0 && (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Vocabulary Tier Distribution</CardTitle>
                        <CardDescription>Words grouped by frequency tier (click to filter)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div ref={tierChartRef}>
                          <VocabularyTierChart
                            data={tierDistribution}
                            animationEnabled={animationsEnabled}
                            onSelectTier={(tier) => {
                              if (!frequencyPercentiles) return
                              const min = metrics?.minFrequency || 1
                              const max = metrics?.maxFrequency || frequencyPercentiles.p90
                              if (tier.startsWith('Very High')) {
                                handleChartFilter({ frequency: { min: frequencyPercentiles.p90, max } })
                              } else if (tier.startsWith('High')) {
                                handleChartFilter({ frequency: { min: frequencyPercentiles.p75, max: frequencyPercentiles.p90 } })
                              } else if (tier.startsWith('Medium')) {
                                handleChartFilter({ frequency: { min: frequencyPercentiles.p50, max: frequencyPercentiles.p75 } })
                              } else if (tier.startsWith('Low')) {
                                handleChartFilter({ frequency: { min: frequencyPercentiles.p25, max: frequencyPercentiles.p50 } })
                              } else {
                                handleChartFilter({ frequency: { min, max: frequencyPercentiles.p25 } })
                              }
                            }}
                          />
                        </div>
                        <div className="mt-4">
                          <ChartControls
                            containerRef={tierChartRef}
                            fileBaseName="vocabulary-tiers"
                            csvData={tierDistribution}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {posDistribution && posDistribution.length > 0 && (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Part of Speech Distribution</CardTitle>
                        <CardDescription>Estimated POS breakdown</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div ref={posChartRef}>
                          <PartOfSpeechChart data={posDistribution} animationEnabled={animationsEnabled} />
                        </div>
                        <div className="mt-4">
                          <ChartControls
                            containerRef={posChartRef}
                            fileBaseName="pos-distribution"
                            csvData={posDistribution}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {difficultySpectrum && difficultySpectrum.length > 0 && (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Difficulty Spectrum Heatmap</CardTitle>
                        <CardDescription>Beginner to advanced distribution (click to filter)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div ref={difficultyChartRef}>
                          <DifficultySpectrumChart
                            data={difficultySpectrum}
                            animationEnabled={animationsEnabled}
                            onSelectLevel={(level) => {
                              if (!frequencyPercentiles) return
                              const min = metrics?.minFrequency || 1
                              const max = metrics?.maxFrequency || frequencyPercentiles.p90
                              if (level === 'Beginner') {
                                handleChartFilter({ frequency: { min: frequencyPercentiles.p75, max } })
                              } else if (level === 'Intermediate') {
                                handleChartFilter({ frequency: { min: frequencyPercentiles.p25, max: frequencyPercentiles.p75 } })
                              } else {
                                handleChartFilter({ frequency: { min, max: frequencyPercentiles.p25 } })
                              }
                            }}
                          />
                        </div>
                        <div className="mt-4">
                          <ChartControls
                            containerRef={difficultyChartRef}
                            fileBaseName="difficulty-spectrum"
                            csvData={difficultySpectrum}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {zipfianData && zipfianData.length > 0 && (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Zipfian Distribution</CardTitle>
                        <CardDescription>Rank vs. frequency (log scale)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div ref={zipfChartRef}>
                          <ZipfianDistributionChart data={zipfianData} />
                        </div>
                        <div className="mt-4">
                          <ChartControls
                            containerRef={zipfChartRef}
                            fileBaseName="zipfian-distribution"
                            csvData={zipfianData}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {cumulativeStacked && cumulativeStacked.length > 0 && fileKeys.length > 0 && (
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Cumulative Vocabulary Stacked Chart</CardTitle>
                      <CardDescription>Contribution per file over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div ref={cumulativeChartRef}>
                        <CumulativeVocabularyStackedChart
                          data={cumulativeStacked}
                          fileKeys={fileKeys}
                          animationEnabled={animationsEnabled}
                        />
                      </div>
                      <div className="mt-4">
                        <ChartControls
                          containerRef={cumulativeChartRef}
                          fileBaseName="cumulative-vocabulary"
                          csvData={cumulativeStacked}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {networkData.nodes.length > 0 && (
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Word Network Visualization</CardTitle>
                      <CardDescription>Force-directed graph with frequency-based node sizes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WordNetworkGraph nodes={networkData.nodes} links={networkData.links} />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'enrichment' && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Enrichment Status</CardTitle>
                  <CardDescription>Word enrichment with definitions, synonyms, and examples</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card variant="outlined">
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Enriched</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                        </CardContent>
                      </Card>
                      <Card variant="outlined">
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {project._count.words}
                          </p>
                        </CardContent>
                      </Card>
                      <Card variant="outlined">
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                        </CardContent>
                      </Card>
                      <Card variant="outlined">
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">0%</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Button className="w-full" onClick={() => {}} disabled>
                      Start Enrichment (Coming Soon)
                    </Button>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Word enrichment will add definitions, synonyms, antonyms, and example sentences to your vocabulary.
                      This feature is coming in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
