<template>
    <div class="particle-background">
        <!-- 粒子画布 -->
        <canvas ref="particleCanvas" class="particle-canvas"></canvas>

        <!-- 内容插槽 -->
        <div class="particle-content">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const particleCanvas = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
let particles: Particle[] = []
let ctx: CanvasRenderingContext2D | null = null

// 粒子类
class Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    color: string

    constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth
        this.y = Math.random() * canvasHeight
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 2 + 0.5
        this.opacity = Math.random() * 0.5 + 0.1

        const colors = [
            'rgba(100, 180, 255, opacity)',
            'rgba(0, 120, 255, opacity)',
            'rgba(80, 160, 255, opacity)',
            'rgba(0, 200, 255, opacity)',
            'rgba(60, 140, 240, opacity)'
        ]
        // 修复：使用空值合并操作符确保返回 string 类型
        this.color = colors[Math.floor(Math.random() * colors.length)] ?? 'rgba(100, 180, 255, opacity)'
    }

    update(canvasWidth: number, canvasHeight: number) {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1

        this.vx += (Math.random() - 0.5) * 0.02
        this.vy += (Math.random() - 0.5) * 0.02

        const maxSpeed = 1
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed
            this.vy = (this.vy / speed) * maxSpeed
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color.replace('opacity', this.opacity.toString())
        ctx.fill()
    }
}

// 初始化粒子系统
const initParticles = () => {
    if (!particleCanvas.value) return

    const canvas = particleCanvas.value
    ctx = canvas.getContext('2d')

    const resizeCanvas = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particleCount = 80
    particles = Array.from({ length: particleCount }, () =>
        new Particle(canvas.width, canvas.height)
    )

    const animate = () => {
        if (!ctx || !canvas) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        particles.forEach(particle => {
            particle.update(canvas.width, canvas.height)
            particle.draw(ctx!)
        })

        drawConnections()
        animationId = requestAnimationFrame(animate)
    }

    // 修复：添加粒子存在性检查
    const drawConnections = () => {
        if (!ctx) return

        const maxDistance = 150

        for (let i = 0; i < particles.length; i++) {
            const particleA = particles[i]
            if (!particleA) continue

            for (let j = i + 1; j < particles.length; j++) {
                const particleB = particles[j]
                if (!particleB) continue

                const dx = particleA.x - particleB.x
                const dy = particleA.y - particleB.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.15
                    ctx!.beginPath()
                    ctx!.moveTo(particleA.x, particleA.y)
                    ctx!.lineTo(particleB.x, particleB.y)
                    ctx!.strokeStyle = `rgba(100, 180, 255, ${opacity})`
                    ctx!.lineWidth = 0.5
                    ctx!.stroke()
                }
            }
        }
    }

    animate()
}

// 清理粒子系统
const cleanupParticles = () => {
    if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
    }
    window.removeEventListener('resize', () => { })
    particles = []
    ctx = null
}

onMounted(() => {
    initParticles()
})

onBeforeUnmount(() => {
    cleanupParticles()
})
</script>

<style lang="less" scoped>
.particle-background {
    position: relative;
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #0a0e27 0%, #0d1b3e 30%, #0f1f4b 50%, #0a1628 70%, #060b1f 100%);
    background-size: 400% 400%;
    animation: techGradient 15s ease infinite;
    overflow: hidden;

    // 光晕效果
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
            radial-gradient(ellipse at 20% 50%, rgba(0, 100, 255, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(0, 150, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(0, 80, 200, 0.12) 0%, transparent 50%);
        animation: glowPulse 8s ease-in-out infinite alternate;
        pointer-events: none;
        z-index: 1;
    }

    // 网格线效果
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
            linear-gradient(rgba(0, 150, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 150, 255, 0.03) 1px, transparent 1px);
        background-size: 50px 50px;
        animation: gridMove 20s linear infinite;
        pointer-events: none;
        z-index: 1;
    }

    // 粒子画布
    .particle-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2;
    }

    // 内容容器
    .particle-content {
        position: relative;
        z-index: 3;
        width: 100%;
        height: 100%;
    }
}

@keyframes techGradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

@keyframes glowPulse {
    0% {
        opacity: 0.5;
        transform: scale(1);
    }

    50% {
        opacity: 1;
        transform: scale(1.05);
    }

    100% {
        opacity: 0.7;
        transform: scale(1.02);
    }
}

@keyframes gridMove {
    0% {
        transform: translate(0, 0);
    }

    100% {
        transform: translate(50px, 50px);
    }
}
</style>
