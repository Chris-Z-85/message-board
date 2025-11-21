// Message Board Schema
//   Schema driven development is Keystone's modus operandi
//
// This file defines the data models for a message board application
// with support for messages, replies, and user sessions

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, relationship, timestamp } from '@keystone-6/core/fields'

// Note: Types are generated when you run `keystone dev` or `keystone build`
//   Once generated, you can import: import { type Lists } from '.keystone/types'
type Lists = any // Temporary type until .keystone/types is generated

export const lists = {
  UserSession: list({
    access: allowAll,

    fields: {
      displayName: text({
        label: 'Display name',
        validation: { isRequired: false },
      }),

      sessionIdentifier: text({
        label: 'Session identifier',
        validation: { isRequired: true },
        isIndexed: 'unique',
        ui: {
          description:
            'Unique ID tied to a browser session (e.g., UUID stored in a cookie)',
        },
      }),

      createdAt: timestamp({
        label: 'Created at',
        defaultValue: { kind: 'now' },
        ui: {
          itemView: { fieldMode: 'read' },
        },
      }),

      messages: relationship({
        ref: 'Message.author',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['content', 'createdAt'],
          inlineEdit: { fields: ['content'] },
          linkToItem: true,
        },
      }),
    },

    ui: {
      labelField: 'displayName',
      listView: {
        initialColumns: ['displayName', 'sessionIdentifier', 'createdAt'],
      },
    },
  }),

  Message: list({
    access: allowAll,

    fields: {
      content: text({
        label: 'Content',
        validation: { isRequired: true },
        ui: {
          displayMode: 'textarea',
        },
      }),

      createdAt: timestamp({
        label: 'Created at',
        defaultValue: { kind: 'now' },
        ui: {
          itemView: { fieldMode: 'read' },
        },
      }),

      author: relationship({
        label: 'Author',
        ref: 'UserSession.messages',
        many: false,
        ui: {
          displayMode: 'select',
        },
      }),

      // If null -> top-level message (not a reply)
      parent: relationship({
        label: 'Parent message',
        ref: 'Message.replies',
        many: false,
        ui: {
          displayMode: 'select',
        },
      }),

      // Replies to this message (self-referential relationship)
      replies: relationship({
        label: 'Replies',
        ref: 'Message.parent',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['content', 'author', 'createdAt'],
          linkToItem: true,
        },
      }),

      // Always points to the top-level message of the thread
      rootThread: relationship({
        label: 'Root thread',
        ref: 'Message',
        many: false,
        ui: {
          displayMode: 'select',
        },
      }),
    },

    ui: {
      labelField: 'content',
      listView: {
        initialColumns: ['content', 'author', 'createdAt'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
    },
  }),
}
