'use client'

import {
  Area,
  AreaChart,
  BarChart,
  Bar,
  Brush,
  ComposedChart,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'
import { ChartEmptyState, ChartLegend, ChartTooltip } from '@/components/ChartContainer'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316']
const TOOLTIP_STYLE = {
  backgroundColor: '#1f2937',
  border: 'none',
  borderRadius: '0.5rem',
  color: '#f3f4f6',
}

interface FrequencyDistributionChartProps {
  data: Array<{ frequency: number; count: number }>
  onSelectRange?: (min: number, max: number) => void
  animationEnabled?: boolean
}

export function FrequencyDistributionChart({
  data,
  onSelectRange,
  animationEnabled = true,
}: FrequencyDistributionChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmptyState />
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="frequency"
          label={{ value: 'Frequency Range', position: 'insideBottomRight', offset: -5 }}
        />
        <YAxis label={{ value: 'Number of Words', angle: -90, position: 'insideLeft' }} />
        <ChartTooltip />
        <Bar
          dataKey="count"
          fill="#3b82f6"
          radius={[8, 8, 0, 0]}
          isAnimationActive={animationEnabled}
          onClick={(payload) => {
            if (!onSelectRange || !payload?.frequency) return
            const bucketSize = data.length > 1 ? data[1].frequency - data[0].frequency : payload.frequency
            onSelectRange(payload.frequency, payload.frequency + Math.max(1, bucketSize))
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface WordLengthChartProps {
  data: Array<{ length: number; count: number }>
  animationEnabled?: boolean
}

export function WordLengthDistributionChart({
  data,
  animationEnabled = true,
}: WordLengthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="length" label={{ value: 'Word Length (characters)', position: 'insideBottomRight', offset: -5 }} />
        <YAxis label={{ value: 'Number of Words', angle: -90, position: 'insideLeft' }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ fill: '#8b5cf6' }}
          isAnimationActive={animationEnabled}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface LanguageDistributionChartProps {
  data: Array<{ language: string; count: number }>
  onSelectLanguage?: (language: string) => void
  animationEnabled?: boolean
}

export function LanguageDistributionChart({
  data,
  onSelectLanguage,
  animationEnabled = true,
}: LanguageDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ language, count }) => `${language}: ${count}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="count"
          isAnimationActive={animationEnabled}
          onClick={(payload) => {
            if (onSelectLanguage && payload?.language) {
              onSelectLanguage(payload.language)
            }
          }}
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface VocabularyTierChartProps {
  data: Array<{ tier: string; count: number }>
  onSelectTier?: (tier: string) => void
  animationEnabled?: boolean
}

export function VocabularyTierChart({
  data,
  onSelectTier,
  animationEnabled = true,
}: VocabularyTierChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="tier" type="category" width={150} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar
          dataKey="count"
          fill="#ec4899"
          radius={[0, 8, 8, 0]}
          isAnimationActive={animationEnabled}
          onClick={(payload) => {
            if (onSelectTier && payload?.tier) onSelectTier(payload.tier)
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface ZipfianDistributionChartProps {
  data: Array<{ word: string; frequency: number; rank: number }>
}

export function ZipfianDistributionChart({ data }: ZipfianDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    )
  }

  // Take top 100 words for cleaner visualization
  const topWords = data.slice(0, 100)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="rank"
          name="Rank"
          label={{ value: 'Word Rank', position: 'insideBottomRight', offset: -5 }}
        />
        <YAxis
          type="number"
          dataKey="frequency"
          name="Frequency"
          label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
          scale="log"
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Words" data={topWords} fill="#06b6d4" />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

interface WordFrequencyBarChartProps {
  data: Array<{ word: string; frequency: number }>
  onSelectWord?: (word: string) => void
  animationEnabled?: boolean
}

export function WordFrequencyBarChart({
  data,
  onSelectWord,
  animationEnabled = true,
}: WordFrequencyBarChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
        <defs>
          <linearGradient id="wordFrequencyGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="word" type="category" width={120} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar
          dataKey="frequency"
          fill="url(#wordFrequencyGradient)"
          radius={[0, 8, 8, 0]}
          isAnimationActive={animationEnabled}
          onClick={(payload) => {
            if (onSelectWord && payload?.word) onSelectWord(payload.word)
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface FrequencyHistogramChartProps {
  data: Array<{ range: string; count: number; mid: number }>
  onSelectRange?: (min: number, max: number) => void
  animationEnabled?: boolean
}

export function FrequencyHistogramChart({
  data,
  onSelectRange,
  animationEnabled = true,
}: FrequencyHistogramChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar
          dataKey="count"
          fill="#6366f1"
          radius={[6, 6, 0, 0]}
          isAnimationActive={animationEnabled}
          onClick={(payload) => {
            if (!onSelectRange || !payload?.range) return
            const [min, max] = payload.range.split('-').map((v: string) => parseInt(v, 10))
            onSelectRange(min, max)
          }}
        />
        <Line type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2} dot={false} />
        <Brush dataKey="range" height={20} stroke="#3b82f6" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

interface VocabularyGrowthChartProps {
  data: Array<{ fileIndex: number; uniqueWords: number }>
  animationEnabled?: boolean
}

export function VocabularyGrowthChart({ data, animationEnabled = true }: VocabularyGrowthChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fileIndex" label={{ value: 'File Order', position: 'insideBottomRight', offset: -5 }} />
        <YAxis label={{ value: 'Cumulative Unique Words', angle: -90, position: 'insideLeft' }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Area
          type="monotone"
          dataKey="uniqueWords"
          stroke="#10b981"
          fill="url(#growthGradient)"
          isAnimationActive={animationEnabled}
        />
        <Brush dataKey="fileIndex" height={20} stroke="#10b981" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface PartOfSpeechChartProps {
  data: Array<{ partOfSpeech: string; count: number }>
  onSelectPos?: (pos: string) => void
  animationEnabled?: boolean
}

export function PartOfSpeechChart({ data, onSelectPos, animationEnabled = true }: PartOfSpeechChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="partOfSpeech" />
        <YAxis />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar
          dataKey="count"
          fill="#f59e0b"
          radius={[6, 6, 0, 0]}
          isAnimationActive={animationEnabled}
          onClick={(payload) => {
            if (onSelectPos && payload?.partOfSpeech) onSelectPos(payload.partOfSpeech)
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface WordLengthHistogramChartProps {
  data: Array<{ length: number; count: number }>
  onSelectLength?: (length: number) => void
  animationEnabled?: boolean
}

export function WordLengthHistogramChart({
  data,
  onSelectLength,
  animationEnabled = true,
}: WordLengthHistogramChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="length" />
        <YAxis />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar
          dataKey="count"
          fill="#8b5cf6"
          radius={[6, 6, 0, 0]}
          isAnimationActive={animationEnabled}
          onClick={(payload) => {
            if (onSelectLength && payload?.length) onSelectLength(payload.length)
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface DifficultySpectrumChartProps {
  data: Array<{ level: string; count: number }>
  onSelectLevel?: (level: string) => void
  animationEnabled?: boolean
}

export function DifficultySpectrumChart({
  data,
  onSelectLevel,
  animationEnabled = true,
}: DifficultySpectrumChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
  }

  const stackedData = data.reduce((acc, item) => {
    acc[item.level] = item.count
    return acc
  }, {} as Record<string, number>)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={[{ name: 'Difficulty', ...stackedData }]} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={100} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        {data.map((item, index) => (
          <Bar
            key={item.level}
            dataKey={item.level}
            stackId="difficulty"
            fill={COLORS[index % COLORS.length]}
            isAnimationActive={animationEnabled}
            onClick={() => {
              if (onSelectLevel) onSelectLevel(item.level)
            }}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

interface CumulativeVocabularyStackedChartProps {
  data: Array<Record<string, number>>
  fileKeys: string[]
  animationEnabled?: boolean
}

export function CumulativeVocabularyStackedChart({
  data,
  fileKeys,
  animationEnabled = true,
}: CumulativeVocabularyStackedChartProps) {
  if (!data || data.length === 0 || fileKeys.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fileIndex" />
        <YAxis />
        <ChartTooltip />
        <ChartLegend />
        {fileKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId="1"
            stroke={COLORS[index % COLORS.length]}
            fill={COLORS[index % COLORS.length]}
            fillOpacity={0.3}
            isAnimationActive={animationEnabled}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
