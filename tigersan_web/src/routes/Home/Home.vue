<template>
  <div class="main-panel">
    <!-- 左侧: -->
    <div class="left-panel">
      <!-- 导航栏: -->
      <NavBar :model="navModel" :title="AppConfig.Title">
        <div class="footer-panel flex-center">
          <div class="button-panel flex-center">
            <IconButton :iconSize="18" :fontSize="14" :icon="Icons.Skin" :text="Texts.Theme.value"
              :click="ThemeHelper.Toggle" />
            <IconButton :iconSize="18" :fontSize="14" :icon="Icons.Global_Linear" :text="Texts.Language.value"
              :click="config.ToggleLocale" />
          </div>
          <span class="version">{{ Texts.Version.value }}{{ AppConfig.Version }}</span>
          <a class="copyright ellipsis" target="_blank" rel="noopener noreferrer" :href="AppConfig.Url">
            {{ AppConfig.Copyright }}</a>
        </div>
      </NavBar>
    </div>

    <!-- 右侧: -->
    <div class="right-panel">
      <!-- 顶部: -->
      <div class="top-panel">
        <!-- 按钮: -->
        <button class="nav-button square-button" @click="navModel.btnNavSwitch_Click">{{ Icons.Menu }}</button>

        <div class="info-panel flex-right">
          <Select :model="CompanyMgtPageModel.selectCompanyGlobal" />
          <KeyValue :isAutoHidden="true" propName="公司" :propValue="userInfo.companyIdName.name" />
          <IconButton v-if="!NavData.IsAtHome.value && CompanyMgtPageModel.tree.IsActive.value" :icon="Icons.Building_2"
            :text="Texts.Business.value" :click="NavData.InitHome" />
          <IconButton v-if="NavData.IsAtHome.value" :icon="Icons.Setting_Linear" :text="Texts.BasicSettings.value"
            :click="NavData.InitBasicSettings" />
          <IconButton :icon="Icons.Question" :text="Texts.Help.value" />
          <IconButton :icon="Icons.Refresh" :text="Texts.Progress.value" />
          <IconButton :icon="Icons.User" :text="userInfo.nickname" :click="form.Edit" />
          <IconButton :icon="Icons.StartUp" text="" :click="loginFormModel.Logout" />
        </div>
      </div>

      <div class="page-bar-panel">
        <!-- 页标签栏: -->
        <PageBar :model="navModel" />
      </div>

      <!-- 页面: -->
      <div class="page-panel flex-stretch">
        <PageView :model="navModel" />
      </div>
    </div>
  </div>

  <!-- 表单（修改用户信息）: -->
  <PopForm :model="form.userInfoForm">
    <FormRow>
      <FormItem :model="form.configCompany.ItemModel">
        <input type="text" disabled v-model="form.configCompany.Target.value">
      </FormItem>
    </FormRow>
    <FormRow v-if="!userInfo.isAdmin">
      <FormItem :model="form.configDepartment.ItemModel">
        <input type="text" disabled v-model="form.configDepartment.Target.value">
      </FormItem>
    </FormRow>
    <FormRow>
      <FormItem :model="form.configRole.ItemModel">
        <input type="text" disabled v-model="form.configRole.Target.value">
      </FormItem>
    </FormRow>
    <FormRow>
      <FormItem :model="form.configUsername.ItemModel">
        <input type="text" v-model="form.configUsername.Target.value">
      </FormItem>
    </FormRow>
    <FormRow v-if="!userInfo.isAdmin">
      <FormItem :model="form.configTagId.ItemModel">
        <input type="text" v-model="form.configTagId.Target.value">
      </FormItem>
    </FormRow>
    <FormRow v-if="!userInfo.isAdmin">
      <FormItem :model="form.configPhone.ItemModel">
        <input type="text" v-model="form.configPhone.Target.value">
      </FormItem>
    </FormRow>
    <FormRow v-if="!userInfo.isAdmin">
      <FormItem :model="form.configMail.ItemModel">
        <input type="text" v-model="form.configMail.Target.value">
      </FormItem>
    </FormRow>
    <FormRow>
      <button @click="passwordForm.Edit">{{ Texts.ChangePassword.value }}</button>
    </FormRow>
  </PopForm>

  <!-- 表单（修改密码）: -->
  <PopForm :model="passwordForm.passwordForm">
    <FormRow>
      <FormItem :model="passwordForm.configOldPassword.ItemModel">
        <Password :model="passwordForm.oldPassword" />
      </FormItem>
    </FormRow>
    <FormRow>
      <FormItem :model="passwordForm.configPassword.ItemModel">
        <Password :model="passwordForm.password" />
      </FormItem>
    </FormRow>
    <FormRow>
      <FormItem :model="passwordForm.configConfirmPassword.ItemModel">
        <Password :model="passwordForm.confirmPassword" />
      </FormItem>
    </FormRow>
  </PopForm>
</template>

<script lang="ts" setup>
import AppConfig from '@/AppConfig'
import { PasswordForm } from './PasswordForm'
import { onBeforeMount, onMounted } from 'vue'
import { PopForm, FormRow, Password, FormItem, Texts, Icons, IconButton, NavBar, PageBar, PageView, router, ThemeHelper, config, Select, KeyValue, ApiResult, TokenHelper } from '@/0_tigersan_ui/tigerui'
import { UserHelper } from '@/models'
import { useUserInfo } from '@/stores'
import { UserInfoForm } from './UserInfoForm'
import { NavData, navModel } from '@/navs/navModel'
import { loginFormModel } from '@/routes/Login/LoginFormModel'
import { CompanyMgtPageModel } from '@/pages/BasicSettings/BasicSettings/CompanyMgtPage/CompanyMgtPageModel'

// 字段:
const form = new UserInfoForm()
const passwordForm = new PasswordForm()
/** 用户信息 */
const userInfo = useUserInfo()

// 过程:
onBeforeMount(() => {
  if (!UserHelper.IsUserInfoVerifyOk(userInfo)) {
    router.GoTo('/')
    return
  }
})

onMounted(() => {
  ApiResult._logout = () => {
    TokenHelper.Save()
    router.GoTo('/')
  }
})
</script>

<style lang="less" scoped>
.main-panel {
  display: grid;
  grid-template-columns: auto 1fr;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .left-panel {
    height: 100%;
    background: var(--theme-card-background);
  }

  .right-panel {
    display: grid;
    grid-template-rows: auto auto 1fr;

    .top-panel {
      display: grid;
      grid-template-columns: auto 1fr;
      background: var(--theme-card-background);

      .nav-button {
        z-index: 1;
      }

      .info-panel {
        overflow: auto;

        &>* {
          margin-right: 15px;
        }
      }
    }

    .page-bar-panel {
      background: var(--theme-card-background);
    }

    .page-panel {
      overflow: hidden;
      background: var(--theme-panel-background);
    }
  }
}

.footer-panel {
  flex-direction: column;

  .version,
  .copyright {
    margin-top: 10px;
    font-size: 12px;
    color: var(--theme-color-placeholder);
  }
}
</style>