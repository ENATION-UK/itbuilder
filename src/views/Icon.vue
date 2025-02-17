<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <svg v-if="name === 'play'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5v14l11-7z" fill="currentColor"/>
  </svg>

  <svg v-else-if="name === 'stop'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
        fill="currentColor"
        d="M8 16h8V8H8zm4 6q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22"
    />
  </svg>

  <svg v-else-if="name === 'horizontal'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2,12 L22,12" stroke="currentColor" stroke-width="2"/>
    <path d="M7,7 L2,12 L7,17" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M17,7 L22,12 L17,17" stroke="currentColor" stroke-width="2" fill="none"/>
  </svg>

  <svg v-else-if="name === 'vertical'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,2 L12,22" stroke="currentColor" stroke-width="2"/>
    <path d="M7,7 L12,2 L17,7" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M7,17 L12,22 L17,17" stroke="currentColor" stroke-width="2" fill="none"/>
  </svg>

  <svg v-else-if="name === 'shuffle'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
        fill="currentColor"
        d="M14 20v-2h2.6l-3.175-3.175L14.85 13.4L18 16.55V14h2v6zm-8.6 0L4 18.6L16.6 6H14V4h6v6h-2V7.4zm3.775-9.425L4 5.4L5.4 4l5.175 5.175z"
    />
  </svg>

  <svg  v-else-if="name === 'log'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
    <g fill="none">
      <path
          d="M13.75 2a2.25 2.25 0 0 1 2.245 2.096L16 4.25c0-.085-.005-.168-.014-.25h1.764A2.25 2.25 0 0 1 20 6.25v13.5A2.25 2.25 0 0 1 17.75 22H6.25A2.25 2.25 0 0 1 4 19.75V6.25A2.25 2.25 0 0 1 6.25 4h1.764c-.007.058-.01.117-.013.176L8 4.25A2.25 2.25 0 0 1 10.25 2h3.5zm0 4.5h-3.5a2.248 2.248 0 0 1-1.892-1.033l.021.033H6.25a.75.75 0 0 0-.75.75v13.5c0 .414.336.75.75.75h11.5a.75.75 0 0 0 .75-.75V6.25a.75.75 0 0 0-.75-.75h-2.129l.021-.033A2.248 2.248 0 0 1 13.75 6.5zm0-3h-3.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5zM8 14.5h4a.75.75 0 0 0 0-1.5H8a.75.75 0 0 0 0 1.5zm0-4h8A.75.75 0 0 0 16 9H8a.75.75 0 0 0 0 1.5zm0 8h6a.75.75 0 0 0 0-1.5H8a.75.75 0 0 0 0 1.5z"
          fill="currentColor"></path>
    </g>
  </svg>
</template>
