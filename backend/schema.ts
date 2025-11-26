// Message Board Schema
//   Schema driven development is Keystone's modus operandi
//
// This file defines the data models for a message board application
// with support for messages, replies, and user sessions

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, relationship, timestamp } from '@keystone-6/core/fields'
import { pubsub } from './pubsub';

// Note: Types are generated when you run `keystone dev` or `keystone build`
//   Once generated, you can import: import { type Lists } from '.keystone/types'
type Lists = any // Temporary type until .keystone/types is generated

function getThreadIdFromMessage(item: any): string | null {
  if (item.rootThreadId) return String(item.rootThreadId);
  if (item.rootThread?.id) return String(item.rootThread.id);
  if (item.id) return String(item.id);

  return null;
}

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

      parent: relationship({
        label: 'Parent message',
        ref: 'Message.replies',
        many: false,
        ui: {
          displayMode: 'select',
        },
      }),

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

    hooks: {
      async afterOperation({ operation, item }) {
        if (operation !== 'create') return;

        const threadId = getThreadIdFromMessage(item as any);

        if (!threadId) {
          return;
        }

        const channel = `MESSAGE_ADDED_${threadId}`;

        await (pubsub as any).publish(channel, {
          messageAdded: item,
        });
      },
    },
  }),
}