import React, { useEffect, useRef } from 'react';
import './SnowBackground.css';

function SnowBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const updateCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      // canvas의 실제 픽셀 크기 설정
      canvas.width = width;
      canvas.height = height;
    };
    
    updateCanvasSize();

    const snowflakes = [];
    const snowflakeCount = 100;

    class Snowflake {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3 + 1;
        this.speed = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.wind = Math.random() * 0.5 - 0.25;
      }

      update() {
        this.y += this.speed;
        this.x += this.wind;
        
        // 동적으로 width와 height를 참조 (CSS 크기 기준)
        const currentWidth = width || window.innerWidth;
        const currentHeight = height || window.innerHeight;
        
        if (this.y > currentHeight) {
          this.y = -10;
          this.x = Math.random() * currentWidth;
        }
        
        if (this.x > currentWidth) {
          this.x = 0;
        } else if (this.x < 0) {
          this.x = currentWidth;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    // 눈을 전체 화면에 고르게 분포
    for (let i = 0; i < snowflakeCount; i++) {
      const snowflake = new Snowflake();
      // 화면 전체에 고르게 분포
      snowflake.x = (i / snowflakeCount) * width;
      snowflake.y = Math.random() * height;
      snowflakes.push(snowflake);
    }

    function animate() {
      // 동적으로 canvas 크기를 참조
      const currentWidth = width || window.innerWidth;
      const currentHeight = height || window.innerHeight;
      
      ctx.clearRect(0, 0, currentWidth, currentHeight);
      snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      updateCanvasSize();
      // 화면 크기가 변경되면 눈 위치 재조정
      snowflakes.forEach(snowflake => {
        if (snowflake.x > width) snowflake.x = Math.random() * width;
        if (snowflake.y > height) snowflake.y = Math.random() * height;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="snow-canvas" />;
}

export default SnowBackground;

