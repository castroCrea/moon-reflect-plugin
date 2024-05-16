import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription } from '@moonjot/moon'
import { extractTitleFromMarkdown, handleConditions, handleReplacingProperties, turnDate } from '@moonjot/moon-utils'
import { DEFAULT_TEMPLATE } from './template'

interface ReflectPluginSettingsDescription extends PluginSettingsDescription {
  token: {
    type: 'string'
    required: boolean
    label: string
    description: string
  }
  graphId: {
    type: 'string'
    required: boolean
    label: string
    description: string
  }
  template: {
    type: 'text'
    required: boolean
    label: string
    description: string
    default: string
  }
}

interface ReflectPluginSettings extends MoonPluginSettings {
  token: string
  template: string
}

export default class extends MoonPlugin {
  name: string = 'Reflect'
  logo: string = 'https://reflect.app/_next/image?url=%2Fsite%2Ficons%2F1024x1024.png&w=1080&q=75'

  settingsDescription: ReflectPluginSettingsDescription = {
    token: {
      type: 'string',
      required: true,
      label: 'Token',
      description: 'Reflect API token. Go to [https://reflect.app/developer/oauth](https://reflect.app/developer/oauth)'
    },
    graphId: {
      type: 'string',
      required: true,
      label: 'Graph Id',
      description: 'Check in the reflect.app URL https://reflect.app/g/GRAPH_ID_WILL_BE_HERE/RANDOM_NUMBER'
    },
    template: {
      type: 'text',
      required: true,
      label: 'Template of capture',
      description: 'Format your note result inside Reflect. [Documentation](https://github.com/castroCrea/moon-reflect-plugin/blob/main/README.md)',
      default: DEFAULT_TEMPLATE
    }
  }

  settings: ReflectPluginSettings = {
    token: '',
    graphId: '',
    template: DEFAULT_TEMPLATE
  }

  log: ((log: string) => void) | undefined

  constructor (props?: MoonPluginConstructorProps<ReflectPluginSettings>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(props)
    if (!props) return
    if (props.settings) this.settings = { ...this.settings, ...props.settings }
    this.log = props.helpers.moonLog
  }

  integration = {
    callback: async ({ context, markdown }: {
      html: string
      markdown: string
      context: Context
    }
    ) => {
      const handleDateContent = turnDate({ content: this.settings.template })

      const searchObj = {
        content: markdown,
        ...context
      }

      const handlePropertiesContent = handleReplacingProperties({ content: handleDateContent, searchObj }) ?? ''

      let handleConditionContent = handleConditions({ content: handlePropertiesContent, searchObj })?.trim() ?? ''

      const title = extractTitleFromMarkdown(handleConditionContent)

      if (title) handleConditionContent = handleConditionContent.split('\n').slice(1).join('\n')

      if (title) {
        const response = await fetch(`https://reflect.app/api/graphs/${this.settings.graphId}/notes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.settings.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: title,
            content_markdown: handleConditionContent
          })
        }).then(async r => await r.json())
        return response.id ? { url: `https://reflect.app/g/${this.settings.graphId}/${response.id}` } : false
      } else {
        const response = await fetch(
          `https://reflect.app/api/graphs/${this.settings.graphId}/daily-notes`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${this.settings.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: handleConditionContent,
              transform_type: 'list-append'
            })
          }
        ).then(async r => await r.json())
        this.log?.(JSON.stringify({ response }))
        return response.success === true
      }
    },
    buttonIconUrl: 'https://reflect.app/_next/image?url=%2Fsite%2Ficons%2F1024x1024.png&w=1080&q=75'
  }
}
