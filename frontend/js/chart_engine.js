// ==========================================================================
// 2026 Fintech Mobile App - High Performance Canvas Chart Engine
// ==========================================================================

const ChartEngine = {
  // Demo historical price models for all timeframes
  getTimeframeData(timeframe, currentVal = 25450) {
    switch (timeframe) {
      case '1D':
        return [
          { time: '09:15', value: currentVal * 0.982 },
          { time: '10:30', value: currentVal * 0.986 },
          { time: '11:45', value: currentVal * 0.991 },
          { time: '13:00', value: currentVal * 0.995 },
          { time: '14:15', value: currentVal * 0.998 },
          { time: '15:30', value: currentVal }
        ];
      case '1W':
        return [
          { time: 'Mon', value: currentVal * 0.965 },
          { time: 'Tue', value: currentVal * 0.972 },
          { time: 'Wed', value: currentVal * 0.978 },
          { time: 'Thu', value: currentVal * 0.985 },
          { time: 'Fri', value: currentVal * 0.992 },
          { time: 'Sat', value: currentVal * 0.996 },
          { time: 'Sun', value: currentVal }
        ];
      case '1M':
        return [
          { time: 'Week 1', value: currentVal * 0.925 },
          { time: 'Week 2', value: currentVal * 0.948 },
          { time: 'Week 3', value: currentVal * 0.970 },
          { time: 'Week 4', value: currentVal }
        ];
      case '3M':
        return [
          { time: 'May', value: currentVal * 0.840 },
          { time: 'Jun', value: currentVal * 0.890 },
          { time: 'Jul', value: currentVal * 0.945 },
          { time: 'Aug', value: currentVal }
        ];
      case '6M':
        return [
          { time: 'Mar', value: currentVal * 0.760 },
          { time: 'Apr', value: currentVal * 0.810 },
          { time: 'May', value: currentVal * 0.865 },
          { time: 'Jun', value: currentVal * 0.910 },
          { time: 'Jul', value: currentVal * 0.955 },
          { time: 'Aug', value: currentVal }
        ];
      case '1Y':
        return [
          { time: 'Sep', value: currentVal * 0.620 },
          { time: 'Nov', value: currentVal * 0.690 },
          { time: 'Jan', value: currentVal * 0.770 },
          { time: 'Mar', value: currentVal * 0.830 },
          { time: 'May', value: currentVal * 0.910 },
          { time: 'Jul', value: currentVal * 0.960 },
          { time: 'Aug', value: currentVal }
        ];
      case 'ALL':
      default:
        return [
          { time: '2023', value: currentVal * 0.350 },
          { time: '2024', value: currentVal * 0.580 },
          { time: '2025', value: currentVal * 0.810 },
          { time: '2026', value: currentVal }
        ];
    }
  },

  // Render interactive bezier area chart inside a canvas element
  renderInteractiveAreaChart(canvasId, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const data = options.data || this.getTimeframeData(options.timeframe || '1D', options.currentValue || 25450);
    const strokeColor = options.strokeColor || '#00F0FF';
    const isPositive = options.isPositive !== false;

    const values = data.map(d => d.value);
    const minVal = Math.min(...values) * 0.995;
    const maxVal = Math.max(...values) * 1.005;
    const valRange = Math.max(maxVal - minVal, 1);

    const padding = { top: 20, bottom: 25, left: 15, right: 15 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartW,
      y: padding.top + chartH - ((d.value - minVal) / valRange) * chartH,
      data: d
    }));

    const draw = (activeIndex = -1) => {
      ctx.clearRect(0, 0, width, height);

      // Draw horizontal subtle gridlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 3; i++) {
        const gy = padding.top + (chartH / 3) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, gy);
        ctx.lineTo(width - padding.right, gy);
        ctx.stroke();
      }

      // Fill gradient area below bezier curve
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, isPositive ? 'rgba(0, 240, 255, 0.35)' : 'rgba(239, 68, 68, 0.35)');
      gradient.addColorStop(0.7, isPositive ? 'rgba(0, 240, 255, 0.08)' : 'rgba(239, 68, 68, 0.08)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const cp1x = (points[i].x + points[i + 1].x) / 2;
        const cp1y = points[i].y;
        const cp2x = (points[i].x + points[i + 1].x) / 2;
        const cp2y = points[i + 1].y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
      }
      ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
      ctx.lineTo(points[0].x, height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke bezier curve line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const cp1x = (points[i].x + points[i + 1].x) / 2;
        const cp1y = points[i].y;
        const cp2x = (points[i].x + points[i + 1].x) / 2;
        const cp2y = points[i + 1].y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw bottom time labels
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'center';
      points.forEach((p, idx) => {
        if (idx === 0 || idx === points.length - 1 || idx === Math.floor(points.length / 2)) {
          ctx.fillText(p.data.time, p.x, height - 8);
        }
      });

      // Draw interactive scrubber if active
      if (activeIndex >= 0 && activeIndex < points.length) {
        const p = points[activeIndex];

        // Vertical crosshair
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.moveTo(p.x, padding.top);
        ctx.lineTo(p.x, height - padding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // Active glowing point
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Tooltip container
        const formattedVal = '₹' + p.data.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const tooltipText = `${p.data.time} • ${formattedVal}`;
        ctx.font = 'bold 11px Outfit, Inter, sans-serif';
        const textWidth = ctx.measureText(tooltipText).width;
        let tooltipX = p.x;
        if (tooltipX - textWidth / 2 - 10 < 10) tooltipX = 10 + textWidth / 2 + 10;
        if (tooltipX + textWidth / 2 + 10 > width - 10) tooltipX = width - 10 - textWidth / 2 - 10;

        const tooltipY = Math.max(p.y - 20, 16);

        // Tooltip pill background
        ctx.fillStyle = 'rgba(10, 14, 26, 0.92)';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        this.roundRect(ctx, tooltipX - textWidth / 2 - 8, tooltipY - 14, textWidth + 16, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(tooltipText, tooltipX, tooltipY + 1);

        if (options.onScrub) {
          options.onScrub(p.data);
        }
      }
    };

    draw(-1);

    // Attach scrubber listeners
    const handleMove = (clientX) => {
      const bRect = canvas.getBoundingClientRect();
      const relX = clientX - bRect.left;
      let closestIdx = 0;
      let minDistance = Infinity;

      points.forEach((p, i) => {
        const dist = Math.abs(p.x - relX);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      });

      Haptics.tick();
      draw(closestIdx);
    };

    const handleLeave = () => {
      draw(-1);
      if (options.onScrubEnd) options.onScrubEnd();
    };

    canvas.onmousemove = (e) => handleMove(e.clientX);
    canvas.onmouseleave = handleLeave;
    canvas.ontouchmove = (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };
    canvas.ontouchend = handleLeave;
  },

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
};

window.ChartEngine = ChartEngine;
