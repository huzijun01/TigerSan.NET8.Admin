import { Texts } from "../../texts"
import { ToastHelper } from "../../models"

export class CopyBehavior {
    /** 复制文本到剪贴板 */
    static async Copy(str: string, event?: MouseEvent): Promise<void> {
        // 防止默认行为
        event?.preventDefault()

        try {
            // 尝试现代 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(str)
                    ToastHelper.Success(Texts.CopySuccessful.value)
                    return
                } catch (e) {
                    console.warn('Clipboard API failed, falling back', e)
                }
            }

            // 降级方案
            this.fallbackCopyTextToClipboard(str)
            ToastHelper.Success(Texts.CopySuccessful.value)
        } catch (error) {
            console.error('Copy failed:', error)
            ToastHelper.Error(error instanceof Error ? error.message : String(error))
        }
    }

    /** 复制文本到剪贴板（传统方式） */
    private static fallbackCopyTextToClipboard(text: string): void {
        const textArea = document.createElement('textarea')
        textArea.value = text

        // 避免滚动到底部
        textArea.style.position = 'fixed'
        textArea.style.top = '0'
        textArea.style.left = '0'
        textArea.style.width = '2em'
        textArea.style.height = '2em'
        textArea.style.padding = '0'
        textArea.style.border = 'none'
        textArea.style.outline = 'none'
        textArea.style.boxShadow = 'none'
        textArea.style.background = 'transparent'
        textArea.style.opacity = '0'
        textArea.setAttribute('readonly', '') // 防止键盘弹出

        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
            if (!document.execCommand('copy')) {
                throw new Error('execCommand copy returned false')
            }
        } catch (error) {
            console.error('Copy failed:', error)
            ToastHelper.Error(error instanceof Error ? error.message : String(error))
        } finally {
            document.body.removeChild(textArea)
        }
    }
}
