<template>
  <ParticleBackground>
    <div class="login-panel full-view">
      <div class="form-panel flex-center full-view">
        <LoginForm />
      </div>
      <div class="info-panel flex-left" ref="refInfoPanel">
        <IconButton :icon="Icons.Skin" :text="Texts.Theme.value" :click="ThemeHelper.Toggle" />
        <IconButton :icon="Icons.Global_Linear" :text="Texts.Language.value" :click="config.ToggleLocale" />
      </div>
      <Beian :company="AppConfig.YearCompany" :beian="AppConfig.Beian" :link="AppConfig.Url" />
    </div>
  </ParticleBackground>
</template>

<script lang="ts" setup>
import AppConfig from '@/AppConfig'
import LoginForm from './LoginForm.vue'
import ParticleBackground from './ParticleBackground.vue'
import { onBeforeMount } from 'vue'
import { ThemeHelper, IconButton, Icons, config, Texts, Beian } from '@/0_tigersan_ui/tigerui'
import { loginFormModel as model } from './LoginFormModel'

onBeforeMount(() => {
  model.LoginByToken()
})
</script>

<style lang="less" scoped>
.login-panel {
  position: relative;

  .form-panel {
    position: absolute;
    display: grid;
  }

  .info-panel {
    position: absolute;
    margin: 35px 0px 0px 35px;

    &>* {
      margin-right: 15px;
    }
  }

  .beian-panel {
    position: absolute;
    bottom: 0;
    width: 100%;
    margin-bottom: 25px;
  }

  .icon-button {
    &>* {
      color: var(--color-primary-text);
    }

    &:hover {
      &>* {
        color: var(--theme-brand);
      }
    }
  }
}
</style>