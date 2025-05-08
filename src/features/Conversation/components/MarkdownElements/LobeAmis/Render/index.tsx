import { Icon } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { ExternalLink } from 'lucide-react';
import { memo, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';

import { InPortalThreadContext } from '../../../ChatItem/InPortalThreadContext';
import { MarkdownElementProps } from '../../type';

interface AmisProps extends MarkdownElementProps {
  schema?: string;
  title?: string;
}

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  avatar: css`
    border-inline-end: 1px solid ${token.colorSplit};
    background: ${token.colorFillQuaternary};
  `,
  container: css`
    cursor: pointer;

    margin-block-start: 12px;
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;

    color: ${token.colorText};

    box-shadow: ${isDarkMode ? token.boxShadowSecondary : token.boxShadowTertiary};

    &:hover {
      background: ${token.colorFillQuaternary};
    }
  `,
  desc: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  error: css`
    padding: 12px;
    border: 1px solid ${token.colorErrorBorder};
    border-radius: 8px;

    color: ${token.colorError};

    background: ${token.colorErrorBg};
  `,
  loading: css`
    display: flex;
    align-items: center;
    justify-content: center;

    height: 100px;

    font-size: 14px;
    color: ${token.colorTextSecondary};
  `,
  portalContainer: css`
    overflow: auto;

    height: 100%;
    min-height: 100px;
    padding: 16px;

    background: ${token.colorBgContainer};
  `,
  title: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    text-overflow: ellipsis;
  `,
}));

const AmisRenderer = memo<AmisProps>(({ children, node, id }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const [mounted, setMounted] = useState(false);

  // 从 node.properties 中提取 schema 和 title
  const rawChildren = children
    ? typeof children === 'string'
      ? children
      : JSON.stringify(children)
    : '';
  const schemaStr = node?.properties?.schema || rawChildren;
  console.log('Initial schemaStr:', schemaStr);
  console.log('node.properties:', node?.properties);
  console.log('children type:', typeof children);
  console.log('children value:', children);

  const title = node?.properties?.title || 'AMIS 低代码组件';

  // 获取线程上下文和状态
  const inThread = useContext(InPortalThreadContext);
  const [isMessageGenerating, , openAmis, closeAmis] = useChatStore((s) => {
    return [
      chatSelectors.isMessageGenerating(id)(s),
      chatPortalSelectors.isArtifactTagClosed(id)(s),
      s.openArtifact,
      s.closeArtifact,
    ];
  });

  // 在 Portal 中渲染 AMIS 组件
  const renderAmisInPortal = () => {
    console.log('renderAmisInPortal called');

    // 从 localStorage 中获取 schema
    let savedSchema = schemaStr;
    try {
      const storedSchema = localStorage.getItem(`amis-schema-${id}`);
      if (storedSchema) {
        savedSchema = storedSchema;
        console.log('Schema retrieved from localStorage');
      } else {
        console.warn('Schema not found in localStorage, using original schema');
      }
    } catch (e) {
      console.error('Failed to retrieve schema from localStorage:', e);
    }

    console.log('Schema to render:', savedSchema);

    // 检查是否是当前打开的 artifact
    const currentArtifactMessageId = chatPortalSelectors.artifactMessageId(useChatStore.getState());

    if (currentArtifactMessageId === id) {
      // 尝试查找不同的容器选择器
      const selectors = [
        '.artifact-portal-container',
        '.artifact-content',
        '.portal-content',
        '[data-testid="artifact-content"]',
        '[class*="artifact"]',
        '[class*="portal"]',
      ];

      let portalContainer = null;
      for (const selector of selectors) {
        const container = document.querySelector(selector);
        if (container) {
          portalContainer = container;
          console.log('Found portal container with selector:', selector);
          break;
        }
      }

      if (portalContainer) {
        console.log('Rendering AMIS in portal container');
        try {
          // 解析 JSON schema
          let amisSchema;
          try {
            amisSchema = typeof savedSchema === 'string' ? JSON.parse(savedSchema) : savedSchema;
            console.log('Parsed AMIS schema:', amisSchema);

            // 确保有效的 AMIS schema
            if (!amisSchema || typeof amisSchema !== 'object') {
              console.warn('Invalid AMIS schema, using default schema');
              amisSchema = {
                body: {
                  tpl: 'Hello AMIS',
                  type: 'tpl',
                },
                type: 'page',
              };
            }
          } catch (e) {
            console.error('Failed to parse AMIS schema, using default schema:', e);
            amisSchema = {
              body: {
                tpl: 'Hello AMIS',
                type: 'tpl',
              },
              type: 'page',
            };
          }

          // 创建一个新的容器元素
          const amisContainer = document.createElement('div');
          amisContainer.className = styles.portalContainer;
          amisContainer.id = 'amis-renderer-container';
          amisContainer.style.width = '100%';
          amisContainer.style.height = '100%';

          // 清空现有内容并添加新容器
          portalContainer.innerHTML = '';
          portalContainer.append(amisContainer);

          // 动态加载 AMIS
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/amis@2.0.0/sdk/sdk.js';
          script.addEventListener('load', () => {
            if (window.amisRequire) {
              const amis = window.amisRequire('amis/embed');
              amis.embed('#amis-renderer-container', amisSchema);
              console.log('AMIS rendered successfully in portal');
            } else {
              console.error('amisRequire not found');
            }
          });
          document.head.append(script);

          // 添加 CSS
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/amis@2.0.0/sdk/sdk.css';
          document.head.append(link);
        } catch (e) {
          console.error('Failed to parse AMIS schema:', e);
          portalContainer.innerHTML = `
            <div class="${styles.error}">
              Invalid AMIS schema: ${(e as Error).message}
              <pre>${schemaStr}</pre>
            </div>
          `;
        }
      } else {
        console.error('Could not find portal container with any of the selectors');
      }
    } else {
      console.log('Current artifact message ID does not match:', currentArtifactMessageId, id);
    }
  };

  // 打开 AMIS 组件的函数
  const openAmisUI = () => {
    console.log('openAmisUI called, schemaStr:', schemaStr);

    // 如果 schemaStr 为空，使用默认的示例 schema
    const finalSchema =
      schemaStr ||
      JSON.stringify({
        body: {
          tpl: 'Hello AMIS',
          type: 'tpl',
        },
        type: 'page',
      });

    // 将 schema 保存到 localStorage，以便在 Portal 中获取
    try {
      localStorage.setItem(`amis-schema-${id}`, finalSchema);
      console.log('Schema saved to localStorage:', finalSchema);
    } catch (e) {
      console.error('Failed to save schema to localStorage:', e);
    }

    openAmis({
      id,
      identifier: 'amis-schema',
      language: 'json',
      title,
      type: 'amis',
    });

    // 添加延时渲染，确保 Portal 已经打开
    setTimeout(() => {
      renderAmisInPortal();
    }, 500);
  };

  // 在客户端渲染时初始化
  useEffect(() => {
    setMounted(true);
  }, []);

  // 在 Portal 中渲染 AMIS
  useEffect(() => {
    // 如果当前消息正在生成，自动打开 AMIS 组件
    if (mounted && !isMessageGenerating && schemaStr) {
      console.log('mounted');
      // 检查是否是当前打开的 artifact
      const currentArtifactMessageId = chatPortalSelectors.artifactMessageId(
        useChatStore.getState(),
      );

      if (currentArtifactMessageId === id) {
        // 如果当前组件已经在 Portal 中打开，渲染 AMIS 内容
        const portalContainer = document.querySelector('.artifact-portal-container');
        console.log('portalContainers +++++', portalContainer);

        if (portalContainer) {
          import('amis-core')
            .then(({ render }) => {
              try {
                const amisSchema =
                  typeof schemaStr === 'string' ? JSON.parse(schemaStr) : schemaStr;

                // 创建一个新的容器元素
                const amisContainer = document.createElement('div');
                amisContainer.className = styles.portalContainer;

                // 清空现有内容并添加新容器
                portalContainer.innerHTML = '';
                portalContainer.append(amisContainer);

                // 渲染 AMIS 组件
                render(amisSchema, {
                  container: amisContainer, // 将容器作为选项传入
                  locale: 'zh-CN',
                  theme: 'cxd',
                });
              } catch (e) {
                console.error('Failed to parse or render AMIS schema in portal:', e);
                portalContainer.innerHTML = `
                <div class="${styles.error}">
                  Invalid AMIS schema: ${(e as Error).message}
                  <pre>${schemaStr}</pre>
                </div>
              `;
              }
            })
            .catch((e) => {
              console.error('Failed to load AMIS in portal:', e);
              portalContainer.innerHTML = `
              <div class="${styles.error}">
                Failed to load AMIS renderer: ${(e as Error).message}
              </div>
            `;
            });
        }
      }
    }
  }, [mounted, schemaStr, id, styles.error, styles.portalContainer]);

  if (!mounted) {
    return <div className={styles.container}>Loading AMIS renderer...</div>;
  }

  // 渲染预览卡片
  return (
    <Flexbox
      className={styles.container}
      gap={16}
      onClick={() => {
        const currentArtifactMessageId = chatPortalSelectors.artifactMessageId(
          useChatStore.getState(),
        );

        if (currentArtifactMessageId === id) {
          closeAmis();
        } else {
          if (inThread) {
            message.info(t('artifact.inThread'));
            return;
          }
          openAmisUI();
        }
      }}
      width={'100%'}
    >
      <Flexbox align={'center'} flex={1} horizontal>
        <Center className={styles.avatar} height={64} horizontal width={64}>
          <Icon icon={ExternalLink} size={'large'} />
        </Center>
        <Flexbox gap={4} paddingBlock={8} paddingInline={12}>
          <Flexbox className={styles.title}>{title}</Flexbox>
          <Flexbox className={styles.desc} horizontal>
            AMIS 低代码组件
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default AmisRenderer;
