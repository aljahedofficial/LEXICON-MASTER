'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export interface NetworkNode extends d3.SimulationNodeDatum {
  id: string
  label: string
  group: string
  size: number
}

export interface NetworkLink {
  source: string
  target: string
  value: number
}

interface WordNetworkGraphProps {
  nodes: NetworkNode[]
  links: NetworkLink[]
  height?: number
}

export function WordNetworkGraph({ nodes, links, height = 420 }: WordNetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return

    const width = wrapperRef.current.clientWidth || 800
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const zoomGroup = svg.append('g')

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height)

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        zoomGroup.attr('transform', event.transform.toString())
      })

    svg.call(zoom as never)

    const simulation = d3
      .forceSimulation<NetworkNode>(nodes)
      .force(
        'link',
        d3.forceLink<NetworkNode, NetworkLink>(links).id((d: NetworkNode) => d.id).distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))

    const link = zoomGroup
      .append('g')
      .attr('stroke', '#9ca3af')
      .attr('stroke-opacity', 0.6)
      .selectAll<SVGLineElement, NetworkLink>('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.max(1, d.value))

    const colorScale = d3
      .scaleOrdinal<string, string>()
      .domain(['noun', 'verb', 'adjective', 'adverb', 'other'])
      .range(['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'])

    const node = zoomGroup
      .append('g')
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 1)
      .selectAll<SVGCircleElement, NetworkNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => Math.max(6, d.size))
      .attr('fill', (d) => colorScale(d.group))
      .call(
        d3
          .drag<SVGCircleElement, NetworkNode>()
          .on('start', (event: d3.D3DragEvent<SVGCircleElement, NetworkNode, NetworkNode>, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event: d3.D3DragEvent<SVGCircleElement, NetworkNode, NetworkNode>, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event: d3.D3DragEvent<SVGCircleElement, NetworkNode, NetworkNode>, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    node.append('title').text((d: NetworkNode) => d.label)

    const label = zoomGroup
      .append('g')
      .selectAll<SVGTextElement, NetworkNode>('text')
      .data(nodes)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', 10)
      .attr('fill', '#111827')
      .attr('dx', 8)
      .attr('dy', 4)

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as d3.SimulationNodeDatum).x ?? 0)
        .attr('y1', (d) => (d.source as d3.SimulationNodeDatum).y ?? 0)
        .attr('x2', (d) => (d.target as d3.SimulationNodeDatum).x ?? 0)
        .attr('y2', (d) => (d.target as d3.SimulationNodeDatum).y ?? 0)

      node
        .attr('cx', (d) => d.x ?? 0)
        .attr('cy', (d) => d.y ?? 0)

      label
        .attr('x', (d) => d.x ?? 0)
        .attr('y', (d) => d.y ?? 0)
    })

    return () => {
      simulation.stop()
    }
  }, [nodes, links, height])

  return (
    <div ref={wrapperRef} className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <svg ref={svgRef} className="bg-white dark:bg-gray-900" />
    </div>
  )
}
