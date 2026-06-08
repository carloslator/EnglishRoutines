import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RoutineActivity, UserStats } from '../types';

// Color map for routine categories
const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  sleep: { bg: '#3b82f6', text: '#ffffff', label: 'Sleeping 😴' },
  health: { bg: '#10b981', text: '#ffffff', label: 'Health & Care 🧼' },
  study: { bg: '#8b5cf6', text: '#ffffff', label: 'Studying 📚' },
  work: { bg: '#eab308', text: '#1e293b', label: 'Working 💼' },
  leisure: { bg: '#f43f5e', text: '#ffffff', label: 'Leisure & Prep 🍕' },
  other: { bg: '#6b7280', text: '#ffffff', label: 'Other Habits ⚙️' }
};

interface SwimlaneProps {
  userRoutine: RoutineActivity[];
  rohanRoutine: RoutineActivity[];
  mayaRoutine: RoutineActivity[];
}

export const D3ScheduleSwimlane: React.FC<SwimlaneProps> = ({
  userRoutine,
  rohanRoutine,
  mayaRoutine
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<{
    owner: string;
    phrase: string;
    start: number;
    duration: number;
    category: string;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous drawing
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    // Dimensions
    const margin = { top: 30, right: 30, bottom: 50, left: 110 };
    const width = 800;
    const height = 260;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = svgElement
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: 24 Hours
    const xScale = d3.scaleLinear()
      .domain([0, 24])
      .range([0, chartWidth]);

    // Y Scale: 3 Lanes
    const lanes = ['Rohan', 'Maya', 'User'];
    const yScale = d3.scaleBand()
      .domain(lanes)
      .range([0, chartHeight])
      .padding(0.25);

    // Draw grid background for hours (0 to 24)
    const hourTicks = Array.from({ length: 25 }, (_, i) => i);
    
    svg.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .selectAll('line')
      .data(hourTicks)
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#475569')
      .attr('stroke-width', 1);

    // Add X-Axis
    const xAxis = d3.axisBottom(xScale)
      .tickValues([0, 3, 6, 9, 12, 15, 18, 21, 24])
      .tickFormat(d => {
        const hour = d as number;
        if (hour === 0) return 'Midnight (00:00)';
        if (hour === 12) return 'Noon (12:00)';
        if (hour === 24) return 'Midnight (24:00)';
        return `${String(hour).padStart(2, '0')}:00`;
      });

    svg.append('g')
      .attr('class', 'axis-x')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-10)')
      .style('text-anchor', 'end')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '11px')
      .style('fill', '#475569');

    // Add custom styled Y labels
    svg.append('g')
      .selectAll('.y-label-group')
      .data(lanes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(0, ${(yScale(d) || 0) + yScale.bandwidth() / 2})`)
      .each(function(d) {
        const g = d3.select(this);

        // Add visual lane indicators
        g.append('rect')
          .attr('x', -102)
          .attr('y', -yScale.bandwidth() / 2)
          .attr('width', 96)
          .attr('height', yScale.bandwidth())
          .attr('rx', 6)
          .attr('fill', d === 'User' ? '#ecfdf5' : '#f8fafc')
          .attr('stroke', d === 'User' ? '#a7f3d0' : '#e2e8f0')
          .attr('stroke-width', 1.5);

        g.append('text')
          .attr('x', -50)
          .attr('y', 4)
          .attr('text-anchor', 'middle')
          .style('font-family', 'Inter, sans-serif')
          .style('font-size', '12px')
          .style('font-weight', '600')
          .style('fill', d === 'User' ? '#065f46' : '#1e293b')
          .text(d === 'User' ? 'You (Plan) 👋' : d);
      });

    // Function to render swimlane blocks
    const drawBlocks = (data: RoutineActivity[], owner: string) => {
      const laneY = yScale(owner) || 0;
      const laneH = yScale.bandwidth();

      // Render rectangles
      const cards = svg.append('g')
        .selectAll(`.block-${owner}`)
        .data(data)
        .enter()
        .append('g')
        .attr('class', `block-${owner}`);

      cards.append('rect')
        .attr('x', d => xScale(d.startTime))
        .attr('y', laneY)
        .attr('width', d => xScale(d.startTime + d.duration) - xScale(d.startTime))
        .attr('height', laneH)
        .attr('rx', 6)
        .attr('fill', d => CATEGORY_COLORS[d.category]?.bg || '#94a3b8')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.85)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('opacity', 1)
            .attr('stroke', '#0c4a6e')
            .attr('stroke-width', 2);

          setHoveredActivity({
            owner,
            phrase: d.phrase,
            start: d.startTime,
            duration: d.duration,
            category: d.category
          });
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('opacity', 0.85)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5);
          
          setHoveredActivity(null);
        });

      // Add label text inside rectangles (only if block size is sufficient)
      cards.append('text')
        .attr('x', d => xScale(d.startTime + d.duration / 2))
        .attr('y', laneY + laneH / 2 + 4)
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'none')
        .style('font-family', 'Inter, sans-serif')
        .style('font-size', '10px')
        .style('font-weight', '500')
        .style('fill', d => CATEGORY_COLORS[d.category]?.text || '#ffffff')
        .text(d => {
          const widthInPx = xScale(d.startTime + d.duration) - xScale(d.startTime);
          if (widthInPx < 45) return ''; // Skip text if too small
          return d.phrase.length > 8 ? d.phrase.substring(0, 7) + '..' : d.phrase;
        });
    };

    drawBlocks(rohanRoutine, 'Rohan');
    drawBlocks(mayaRoutine, 'Maya');
    drawBlocks(userRoutine, 'User');

    if (userRoutine.length === 0) {
      const laneY = yScale('User') || 0;
      const laneH = yScale.bandwidth();
      svg.append('rect')
        .attr('x', xScale(0))
        .attr('y', laneY)
        .attr('width', chartWidth)
        .attr('height', laneH)
        .attr('rx', 6)
        .attr('fill', '#f8fafc')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');

      svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', laneY + laneH / 2 + 4)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Inter, sans-serif')
        .style('font-size', '10px')
        .style('font-weight', '500')
        .style('fill', '#94a3b8')
        .text('No routines added yet. Design your planner below! ⬇️');
    }

  }, [userRoutine, rohanRoutine, mayaRoutine]);

  return (
    <div className="relative w-full bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">
            24-Hour Comparative Timeline Visualizer
          </h4>
          <p className="text-xs text-slate-500">
            Aligns your schedule with Rohan & Maya to inspect present-simple habits.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end max-w-sm sm:max-w-none">
          {Object.entries(CATEGORY_COLORS).map(([key, item]) => (
            <div key={key} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.bg }}></span>
              <span className="text-[10px] font-medium text-slate-500 capitalize">{key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <svg id="timeline-swimlane" ref={svgRef} className="w-full h-auto" />
        </div>
      </div>

      {hoveredActivity && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs space-y-1 z-15 backdrop-blur-md border border-slate-800 animate-in fade-in duration-200">
          <p className="font-bold border-b border-slate-800 pb-1 text-sky-400">
            {hoveredActivity.owner === 'User' ? 'Your Activity' : `${hoveredActivity.owner}'s Routine`}
          </p>
          <div className="flex justify-between gap-6">
            <span className="capitalize font-medium text-slate-300">Habit Verb:</span>
            <span className="font-mono font-semibold">{hoveredActivity.phrase}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-300">Time Segment:</span>
            <span className="font-mono">
              {String(Math.floor(hoveredActivity.start)).padStart(2, '0')}
              :{hoveredActivity.start % 1 !== 0 ? '30' : '00'} -{' '}
              {String(Math.floor(hoveredActivity.start + hoveredActivity.duration)).padStart(2, '0')}
              :{(hoveredActivity.start + hoveredActivity.duration) % 1 !== 0 ? '30' : '00'}
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-300">Category Tag:</span>
            <span className="font-semibold text-amber-300 capitalize">{hoveredActivity.category}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-300">Form:</span>
            <span className="italic text-emerald-400">
              I {hoveredActivity.phrase} every day.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface DonutProps {
  userRoutine: RoutineActivity[];
}

export const D3DonutDistribution: React.FC<DonutProps> = ({ userRoutine }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Build data representation
    const counts: Record<string, number> = {
      sleep: 0,
      health: 0,
      study: 0,
      work: 0,
      leisure: 0,
      other: 0
    };

    userRoutine.forEach(act => {
      counts[act.category] = (counts[act.category] || 0) + act.duration;
    });

    const dataset = Object.entries(counts)
      .map(([category, value]) => ({
        category,
        value,
        meta: CATEGORY_COLORS[category]
      }))
      .filter(item => item.value > 0);

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    const width = 360;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = svgElement
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2 - 10})`);

    const color = d3.scaleOrdinal<string>()
      .domain(Object.keys(CATEGORY_COLORS))
      .range(Object.values(CATEGORY_COLORS).map(c => c.bg));

    const pie = d3.pie<{ category: string; value: number }>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<{ category: string; value: number }>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius * 0.9);

    const arcHover = d3.arc<d3.PieArcDatum<{ category: string; value: number }>>()
      .innerRadius(radius * 0.53)
      .outerRadius(radius * 0.98);

    const readyPie = pie(dataset);

    // Render path arcs
    const paths = svg.selectAll('path')
      .data(readyPie)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.category))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9)
      .style('cursor', 'pointer');

    // Add animated transitions
    paths.transition()
      .duration(800)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arc(interpolate(t)) || '';
        };
      });

    // If dataset is empty, render a lightweight dashed placeholder ring
    if (dataset.length === 0) {
      svg.append('circle')
        .attr('cx', 0)
        .attr('cy', -10)
        .attr('r', radius * 0.72)
        .attr('fill', 'none')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 12)
        .attr('stroke-dasharray', '6,4');
    }

    // Central statistics text display
    const totalHours = userRoutine.reduce((sum, d) => sum + d.duration, 0);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-5')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '20px')
      .style('font-weight', '800')
      .style('fill', totalHours === 0 ? '#94a3b8' : '#1e293b')
      .text(`${totalHours}h`);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '14')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '10px')
      .style('font-weight', '500')
      .style('fill', '#94a3b8')
      .text(totalHours === 0 ? 'Planner Empty' : 'Budgeted Routine');

    // Dynamic hover interactions to show category values
    paths.on('mouseover', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arcHover)
        .attr('opacity', 1);

      // Create a floating mini tooltip directly inside the Donut center
      svg.selectAll('.donut-center-label').remove();
      
      const pct = Math.round((d.data.value / totalHours) * 100);

      svg.append('rect')
        .attr('class', 'donut-center-label-bg')
        .attr('x', -70)
        .attr('y', -38)
        .attr('width', 140)
        .attr('height', 76)
        .attr('rx', 8)
        .attr('fill', '#0f172a')
        .attr('opacity', 0.95);

      svg.append('text')
        .attr('class', 'donut-center-label')
        .attr('text-anchor', 'middle')
        .attr('y', -16)
        .style('font-family', 'Inter, sans-serif')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#fff')
        .text(CATEGORY_COLORS[d.data.category]?.label.slice(0, 16) || d.data.category);

      svg.append('text')
        .attr('class', 'donut-center-label')
        .attr('text-anchor', 'middle')
        .attr('y', 4)
        .style('font-family', 'Inter, sans-serif')
        .style('font-size', '11px')
        .style('fill', '#38bdf8')
        .text(`Duration: ${d.data.value} hours`);

      svg.append('text')
        .attr('class', 'donut-center-label')
        .attr('text-anchor', 'middle')
        .attr('y', 22)
        .style('font-family', 'Inter, sans-serif')
        .style('font-size', '11px')
        .style('fill', '#10b981')
        .text(`${pct}% of your day`);
    })
    .on('mouseout', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arc)
        .attr('opacity', 0.9);

      // Remove center labels
      svg.selectAll('.donut-center-label').remove();
      svg.selectAll('.donut-center-label-bg').remove();
    });

    // Add explicit external visual legend inside SVG at the bottom
    const legend = svgElement.append('g')
      .attr('transform', `translate(10, ${height - 25})`);

    const colWidth = width / 3;
    dataset.forEach((d, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      
      const itemG = legend.append('g')
        .attr('transform', `translate(${col * colWidth + 10}, ${row * 16})`);

      itemG.append('circle')
        .attr('cx', 5)
        .attr('cy', 5)
        .attr('r', 4.5)
        .attr('fill', d.meta.bg);

      itemG.append('text')
        .attr('x', 14)
        .attr('y', 9)
        .style('font-family', 'Inter, sans-serif')
        .style('font-size', '10px')
        .style('font-weight', '500')
        .style('fill', '#475569')
        .text(`${d.category}: ${d.value}h`);
    });

  }, [userRoutine]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col items-center">
      <div className="w-full text-left self-start mb-2">
        <h4 className="text-sm font-semibold text-slate-800">
          Routine Category Allocation
        </h4>
        <p className="text-xs text-slate-500">
          Distribution of different life roles in your personalized routines.
        </p>
      </div>
      <div className="w-full max-w-[300px]">
        <svg id="category-donut" ref={svgRef} className="w-full h-auto" />
      </div>
    </div>
  );
};

interface ProgressChartProps {
  stats: UserStats;
}

export const D3ProgressColumnChart: React.FC<ProgressChartProps> = ({ stats }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Normalize raw stats to an array of points
    const data = [
      { module: 'Vocabulary', score: stats.vocabGapScore, max: 8, color: '#f97316' }, // Twinkl Orange
      { module: 'Dialogue Fill', score: stats.dialogueScore, max: 4, color: '#0ea5e9' }, // Light Blue
      { module: 'Word Scramble', score: stats.grammarScrambleScore, max: 4, color: '#8b5cf6' }, // Violet
      { module: 'Error Spotting', score: stats.errorsScore, max: 3, color: '#10b981' } // Emerald
    ];

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    const width = 400;
    const height = 280;
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = svgElement
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X Scale: Categories
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.module))
      .range([0, chartWidth])
      .padding(0.4);

    // Y Scale: Percentage (0% to 100%)
    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([chartHeight, 0]);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '10px')
      .style('font-weight', '500')
      .style('fill', '#475569');

    // Y Axis (Percentage)
    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))
      .selectAll('text')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '10px')
      .style('fill', '#64748b');

    // Add Grid Line overlays
    svg.append('g')
      .attr('opacity', 0.05)
      .selectAll('line')
      .data([20, 40, 60, 80, 100])
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#000000')
      .attr('stroke-width', 1);

    // Render underlying full grey towers
    svg.selectAll('.bg-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bg-bar')
      .attr('x', d => xScale(d.module) || 0)
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', chartHeight)
      .attr('rx', 4)
      .attr('fill', '#f1f5f9');

    // Draw active indicator columns reporting percentages
    const activeColumns = svg.selectAll('.score-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'score-bar')
      .attr('x', d => xScale(d.module) || 0)
      .attr('y', chartHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .style('cursor', 'pointer');

    // Animate active column growths
    activeColumns.transition()
      .duration(1000)
      .attr('y', d => yScale((d.score / d.max) * 100))
      .attr('height', d => chartHeight - yScale((d.score / d.max) * 100));

    // Append score indicators text
    svg.selectAll('.score-text')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'score-text')
      .attr('x', d => (xScale(d.module) || 0) + xScale.bandwidth() / 2)
      .attr('y', chartHeight)
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '10px')
      .style('font-weight', '700')
      .style('fill', '#1e293b')
      .text(d => `${d.score}/${d.max}`)
      .transition()
      .duration(1000)
      .attr('y', d => yScale((d.score / d.max) * 100) - 6);

    // Render percentage flag inside the columns
    svg.selectAll('.pct-text')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'pct-text')
      .attr('x', d => (xScale(d.module) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale((d.score / d.max) * 100) + 16)
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '9px')
      .style('font-weight', '500')
      .style('fill', d => d.module === 'Vocabulary' ? '#ffedd5' : '#ffffff')
      .style('opacity', 0)
      .text(d => `${Math.round((d.score / d.max) * 100)}%`)
      .transition()
      .delay(400)
      .duration(800)
      .style('opacity', d => (d.score / d.max) * 100 > 15 ? 1 : 0); // Show only if column is tall enough

  }, [stats]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col items-center">
      <div className="w-full text-left self-start mb-2">
        <h4 className="text-sm font-semibold text-slate-800 font-sans">
          Accuracy Matrix Scorecard
        </h4>
        <p className="text-xs text-slate-500">
          Module-by-module completion and accuracy comparison.
        </p>
      </div>
      <div className="w-full">
        <svg id="progress-column" ref={svgRef} className="w-full h-auto" />
      </div>
    </div>
  );
};
