<template>
  <div class="login-form-panel">
    <div class="left-panel flex-column">
      <img class="logo" src="/logo.png">
      <div class="company ellipsis">{{ AppConfig.Company }}</div>
      <div class="profile ellipsis">{{ AppConfig.Profile }}</div>
    </div>
    <div class="right-panel">
      <div class="title flex-center ellipsis">{{ AppConfig.LoginTitle }}</div>
      <div class="slogan flex-center ellipsis">{{ AppConfig.Slogan }}</div>
      <div class="content-panel flex-stretch">
        <Form :marginH="0">
          <FormRow>
            <FormItem :model="model.configUsername.ItemModel">
              <TextBox type="text" :model="model.uname"></TextBox>
            </FormItem>
          </FormRow>
          <FormRow>
            <FormItem :model="model.configPassword.ItemModel">
              <Password :model="model.pwd"></Password>
            </FormItem>
          </FormRow>
          <FormRow>
            <FormItem :model="model.configCaptcha.ItemModel">
              <div class="captcha-panel">
                <TextBox type="text" :model="model.captcha"></TextBox>
                <img class="captcha-img" :src="model.CaptchaUrl.value" @click="model.UpdateCaptcha">
              </div>
            </FormItem>
          </FormRow>
        </Form>
      </div>
      <div class="button-panel flex-stretch">
        <button @click="model.form.OnSubmit()">{{ Texts.Login.value }}</button>
        <div class="code-login link flex-right">{{ Texts.VerificationCodeLogin.value }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppConfig from '@/AppConfig'
import { onMounted } from 'vue'
import { useUserInfo } from '@/stores'
import { loginFormModel as model } from './LoginFormModel'
import { Texts, Form, FormRow, FormItem, TextBox, Password } from '@/0_tigersan_ui/tigerui'

onMounted(async () => {
  const userInfo = useUserInfo()
  userInfo.Clear()
  await model.form.Init()
  await model.UpdateCaptcha()
})
</script>

<style lang="less" scoped>
.login-form-panel {
  display: grid;
  grid-template-columns: auto auto;
  border-radius: 15px;
  overflow: hidden;
  background: var(--theme-card-background);

  &>* {
    align-items: center;
    justify-content: center;
  }

  .left-panel {
    padding: 0px 100px 50px 100px;
    background: linear-gradient(135deg, #2c3e50 0%, #1a2632 100%);

    &>* {
      color: var(--color-primary-text);
    }

    .logo {
      width: 200px;
      height: 200px;
    }

    .company {
      font-size: 24px;
      font-weight: bold;
    }

    .profile {
      margin-top: 15px;
      font-size: 18px;
    }
  }

  .right-panel {
    padding: 30px;

    .title {
      padding: 30px 30px 0px 30px;
      font-size: 32px;
      font-weight: bold;
    }

    .slogan {
      padding: 15px 30px 0px 30px;
      font-size: 18px;
      font-weight: bold;
    }

    .content-panel {
      .form-panel {
        margin: 0px;

        #pwd {
          width: 100%;
          vertical-align: middle;
        }

        .captcha-panel {
          display: grid;
          grid-column: 1fr auto;

          .textbox {
            grid-column: 1/2;
            margin-right: 5px;
          }

          .captcha-img {
            grid-column: 2/3;
            height: 35px;
            width: 87.5px;
            cursor: pointer;
          }
        }
      }
    }
  }

  .button-panel {
    flex-direction: column;

    .code-login {
      padding-top: 15px;
    }
  }
}

@media (max-width: 900px) {
  .left-panel {
    display: none;
  }
}
</style>