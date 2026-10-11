<template>
  <div
    class="flag-zone"
    @mouseenter="isVisible = true"
    @mouseleave="onLeave"
  >
    <div
      class="flag-easter-egg"
      :class="{ visible: isVisible, hovering: isHovering }"
      @click="goToMemorial"
      @mouseenter="isHovering = true"
    >
      <div class="flag-wrapper">
        <div class="flag-pole"></div>
        <div class="flag-cloth">
          <div class="flag-star star-big">★</div>
          <div class="flag-star star-s1">★</div>
          <div class="flag-star star-s2">★</div>
          <div class="flag-star star-s3">★</div>
          <div class="flag-star star-s4">★</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isVisible = ref(false)
const isHovering = ref(false)

const onLeave = () => {
  isVisible.value = false
  isHovering.value = false
}

const goToMemorial = () => {
  router.push('/hero-memorial')
}
</script>

<style scoped>
.flag-zone {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 120px;
  height: 120px;
  z-index: 9998;
}

.flag-easter-egg {
  position: absolute;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 64px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px) scale(0.8);
  transition: opacity 0.4s ease, transform 0.4s ease;
  pointer-events: none;
}

.flag-easter-egg.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.flag-easter-egg.hovering {
  transform: translateY(-4px) scale(1.1);
}

.flag-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.flag-pole {
  position: absolute;
  right: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #8b7355, #6b5344);
  border-radius: 2px;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.3);
}

.flag-cloth {
  position: absolute;
  right: 3px;
  top: 6px;
  width: 40px;
  height: 28px;
  background: linear-gradient(90deg, #de2910 0%, #c41e3a 50%, #de2910 100%);
  transform-origin: right center;
  animation: flagWave 2s ease-in-out infinite;
  box-shadow: -2px 2px 6px rgba(0, 0, 0, 0.2);
}

.flag-easter-egg.hovering .flag-cloth {
  animation-duration: 0.8s;
}

@keyframes flagWave {
  0% {
    transform: skewY(0deg) scaleX(1);
    border-radius: 0 2px 2px 0;
  }
  25% {
    transform: skewY(-2deg) scaleX(0.95);
    border-radius: 0 4px 6px 2px;
  }
  50% {
    transform: skewY(1deg) scaleX(1.02);
    border-radius: 0 2px 2px 0;
  }
  75% {
    transform: skewY(3deg) scaleX(0.98);
    border-radius: 0 6px 4px 2px;
  }
  100% {
    transform: skewY(0deg) scaleX(1);
    border-radius: 0 2px 2px 0;
  }
}

.flag-star {
  position: absolute;
  color: #ffde00;
  text-shadow: 0 0 2px rgba(255, 222, 0, 0.8);
  line-height: 1;
}

.star-big {
  font-size: 14px;
  top: 4px;
  left: 5px;
}

.star-s1 {
  font-size: 5px;
  top: 2px;
  left: 19px;
  transform: rotate(30deg);
}

.star-s2 {
  font-size: 5px;
  top: 7px;
  left: 24px;
  transform: rotate(-10deg);
}

.star-s3 {
  font-size: 5px;
  top: 14px;
  left: 23px;
  transform: rotate(20deg);
}

.star-s4 {
  font-size: 5px;
  top: 20px;
  left: 18px;
  transform: rotate(-20deg);
}

@media (max-width: 600px) {
  .flag-zone {
    width: 100px;
    height: 100px;
  }
  
  .flag-easter-egg {
    right: 16px;
    bottom: 16px;
    width: 40px;
    height: 54px;
  }
  
  .flag-cloth {
    width: 32px;
    height: 22px;
  }
  
  .star-big {
    font-size: 11px;
  }
  
  .star-s1,
  .star-s2,
  .star-s3,
  .star-s4 {
    font-size: 4px;
  }
}
</style>
