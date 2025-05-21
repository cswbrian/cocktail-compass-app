'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { translations } from '@/translations';

interface FlavorProfile {
  sweetness: number;
  sourness: number;
  body: number;
  complexity: number;
  booziness: number;
}

export default function FlavorRadar({ 
  flavorProfile,
  t,
  color
}: { 
  flavorProfile: FlavorProfile,
  t: typeof translations.en | typeof translations.zh,
  color: string
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 300;
  const height = 300;
  const radius = 100;
  const levels = 5;

  useEffect(() => {
    if (!svgRef.current || !flavorProfile) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Create a group element and translate it to center
    const g = svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    // Create the straight lines radiating outward from the center
    const angleSlice = (Math.PI * 2) / 5;

    // Create scales
    const scale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, radius]);

    // Draw background circles
    for (let j = 1; j <= levels; j++) {
      const levelFactor = j / levels;
      g.append('circle')
        .attr('r', radius * levelFactor)
        .attr('class', 'gridCircle')
        .style('fill', 'none')
        .style('stroke', '#374151')
        .style('stroke-width', '0.5');
    }

    // Draw axis lines
    for (let i = 0; i < 5; i++) {
      const angle = angleSlice * i;
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radius * Math.cos(angle - Math.PI/2))
        .attr('y2', radius * Math.sin(angle - Math.PI/2))
        .attr('class', 'line')
        .style('stroke', '#70717a')
        .style('stroke-width', '0.5');
    }

    // Create data points in the correct order
    const data = [
      flavorProfile.booziness,   // Top
      flavorProfile.sweetness,   // Top right
      flavorProfile.sourness,    // Bottom right
      flavorProfile.body,        // Bottom left
      flavorProfile.complexity   // Top left
    ];

    // Draw data polygon
    const points = data.map((d, i) => {
      const angle = angleSlice * i - Math.PI/2;
      return [
        scale(d) * Math.cos(angle),
        scale(d) * Math.sin(angle)
      ];
    });

    // Create the polygon path
    const lineGenerator = d3.line<[number, number]>();
    g.append('path')
      .datum(points as [number, number][])
      .attr('d', lineGenerator.curve(d3.curveLinearClosed))
      .attr('fill', color)
      .attr('stroke', color)
      .attr('stroke-width', 2);

    // Add labels
    const labels = [
      t.booziness,   // 'Booziness' -> '酒感' (zh) / 'Booziness' (en)
      t.sweetness,   // 'Sweetness' -> '甜度' (zh) / 'Sweetness' (en)
      t.sourness,    // 'Sourness' -> '酸度' (zh) / 'Sourness' (en)
      t.body,        // 'Body' -> '口感' (zh) / 'Body' (en)
      t.complexity   // 'Complexity' -> '複雜度' (zh) / 'Complexity' (en)
    ];
    for (let i = 0; i < 5; i++) {
      const angle = angleSlice * i - Math.PI/2;
      const x = (radius + 20) * Math.cos(angle);
      const y = (radius + 20) * Math.sin(angle);
      
      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .style('font-size', '12px')
        .text(labels[i]);
    }

  }, [flavorProfile, t, color]);

  return (
    <svg 
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto"
    />
  );
} 