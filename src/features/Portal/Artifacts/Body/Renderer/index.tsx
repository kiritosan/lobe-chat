import { Markdown, Mermaid } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { memo } from 'react';

import HTMLRenderer from './HTML';
import SVGRender from './SVG';

// 使用相对路径导入
// 定义类型以兼容动态导入
interface AmisRendererProps {
  code: string;
}
const AmisRenderer = dynamic<AmisRendererProps>(() => import('./Amis'), { ssr: false });

const ReactRenderer = dynamic(() => import('./React'), { ssr: false });

const Renderer = memo<{ content: string; type?: string }>(({ content, type }) => {
  console.log('Renderer', type);
  console.log('Rednder', content);
  switch (type) {
    case 'application/lobe.artifacts.react': {
      return <ReactRenderer code={content} />;
    }

    case 'image/svg+xml': {
      return <SVGRender content={content} />;
    }

    case 'application/lobe.artifacts.mermaid': {
      return <Mermaid variant={'borderless'}>{content}</Mermaid>;
    }

    case 'text/markdown': {
      return <Markdown style={{ overflow: 'auto' }}>{content}</Markdown>;
    }

    case 'amis': {
      return <AmisRenderer code={content} />;
    }

    default: {
      return <HTMLRenderer htmlContent={content} />;
    }
  }
});

export default Renderer;
