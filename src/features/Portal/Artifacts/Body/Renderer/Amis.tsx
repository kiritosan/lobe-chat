'use client';

import { createStyles } from 'antd-style';
import { memo, useEffect, useRef } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: auto;
    height: 100%;
    padding: 16px;
    background: ${token.colorBgContainer};
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
}));

interface AmisRendererProps {
  code: string;
}

const AmisRenderer = memo<AmisRendererProps>(({ code }) => {
  console.log('code', code);
  const { styles } = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  // const [error, setError] = useState<string | null>(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const renderAmis = async () => {
    //   try {
    //     setLoading(true);
    //     setError(null);

    //     // 解析 JSON schema
    //     const amisSchema = typeof code === 'string' ? JSON.parse(code) : code;
    //     console.log('amisSchema', amisSchema);

    //     // 动态导入 amis
    //     const [amisCore] = await Promise.all([
    //       import('amis-core'),
    //       // 这些模块虽然不直接使用，但需要导入以确保 AMIS 正常工作
    //       import('amis-ui'),
    //       // import('amis-theme-default')
    //     ]);

    //     // 引入样式
    //     if (document.querySelector('#amis-css') === null) {
    //       const link = document.createElement('link');
    //       link.id = 'amis-css';
    //       link.rel = 'stylesheet';
    //       link.href = '//unpkg.com/amis@3.6.3/sdk/sdk.css';
    //       document.head.append(link);
    //     }

    //     // 确保DOM已经渲染
    //     setTimeout(() => {
    //       // 再次检查containerRef是否可用
    //       if (!containerRef.current) {
    //         console.error('Container ref is still not available');
    //         setError('Container ref is not available');
    //         setLoading(false);
    //         return;
    //       }

    //       // 清空容器
    //       containerRef.current.innerHTML = '';

    //       // 创建 AMIS 渲染器
    //       const { render } = amisCore;

    //       window.render = render
    //       window.dom = containerRef.current
    //       window.amisSchema = amisSchema

    //       // 渲染 AMIS 组件
    //       render(amisSchema, {
    //         container: containerRef.current,
    //         locale: 'zh-CN',
    //         theme: 'cxd',
    //       });

    //       setLoading(false);
    //     }, 0); // 使用setTimeout确保在DOM更新后执行

    //   } catch (e) {
    //     console.error('Failed to render AMIS:', e);
    //     setError((e as Error).message);
    //     setLoading(false);
    //   }
    // };

    // // 只有当组件已挂载时才执行渲染
    // if (containerRef.current) {
    //   console.log('containerRef.current', containerRef.current)
    //   renderAmis();
    // } else {
    //   console.log('containerRef is not available yet, waiting for DOM');
    //   // 给DOM一点时间来渲染
    //   const timer = setTimeout(() => {
    //     console.log('containerRef.current', containerRef.current)
    //     if (containerRef.current) {
    //       console.log('containerRef is now available');
    //       renderAmis();
    //     } else {
    //       console.error('containerRef is still not available after delay');
    //       setError('Container ref is not available');
    //       setLoading(false);
    //     }
    //   }, 100); // 短暂延迟确保DOM已渲染

    //   return () => clearTimeout(timer); // 清理定时器
    // }

    // 在 Portal 中渲染 AMIS 组件

    const renderAmisInPortal = () => {
      console.log('renderAmisInPortal called');
      console.log('Schema to render:', code);

      // 检查是否是当前打开的 artifact
      // const currentArtifactMessageId = chatPortalSelectors.artifactMessageId(useChatStore.getState());

      // 尝试查找不同的容器选择器
      const selectors = [
        // '.artifact-portal-container',
        // '.artifact-content',
        // '.portal-content',
        // '[data-testid="artifact-content"]',
        // '[class*="artifact"]',
        // '[class*="portal"]',
        '#amis-container',
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
            console.log('code', code);
            amisSchema = typeof code === 'string' ? JSON.parse(code) : code;
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
                <pre>${code}</pre>
              </div>
            `;
        }
      } else {
        console.error('Could not find portal container with any of the selectors');
      }
    };

    renderAmisInPortal();
  }, [code]);

  // if (loading) {
  //   return <div className={styles.loading}>加载 AMIS 渲染器中...</div>;
  // }

  // if (error) {
  //   return (
  //     <div className={styles.error}>
  //       <h4>AMIS 渲染错误</h4>
  //       <p>{error}</p>
  //       <pre>{typeof code === 'string' ? code.slice(0, 500) : JSON.stringify(code, null, 2).slice(0, 500)}</pre>
  //       {typeof code === 'string' && code.length > 500 && <p>...(内容已截断)</p>}
  //     </div>
  //   );
  // }

  return (
    <>
      <div>Amis</div>
      <div className={styles.container} id="amis-container" ref={containerRef} />
    </>
  );
});

export default AmisRenderer;
