import Dialog from '../components/Dialog/Dialog.vue'
import { type ComputedRef } from 'vue'
import { Texts } from '../texts'
import { Colors } from '../base'
import { ComponentHelper } from './ComponentHelper/ComponentHelper'
import { DialogMode, DialogModel, dialogModels, type DialogCallback } from '../models/Dialog/DialogModel'

export class DialogHelper {
  private static Init() {
    if (document.querySelector('.dialog-mask')) return

    ComponentHelper.AppendApp(Dialog)
  }

  static Show<T>(
    title: string | ComputedRef<string>,
    msg: string,
    data?: T,
    callback?: DialogCallback<T>,
    mode: DialogMode = DialogMode.NoButton,
    background: string = Colors.Brand) {

    DialogHelper.Init()

    var strMsg = msg.toString().trim()

    if (dialogModels.some(m => m.Msg.value === strMsg)) return

    dialogModels.push(new DialogModel(title, strMsg, data, callback, mode, background))
  }

  static Information(msg: string) {
    DialogHelper.Show(Texts.Information, msg)
  }

  static Success(msg: string) {
    DialogHelper.Show(Texts.Success, msg, undefined, undefined, DialogMode.NoButton, Colors.Success)
  }

  static Warning(msg: string) {
    DialogHelper.Show(Texts.Warning, msg, undefined, undefined, DialogMode.NoButton, Colors.Warning)
  }

  static Error(msg: string) {
    DialogHelper.Show(Texts.Error, msg, undefined, undefined, DialogMode.NoButton, Colors.Danger)
  }
}