import { SKIP, visit } from 'unist-util-visit';

const AMIS_TAG = 'lobeAmis';

function rehypeAmisPlugin() {
  return (tree: any) => {
    visit(tree, (node, index, parent) => {
      if (node.type === 'element' && node.tagName === 'p' && node.children.length > 0) {
        const firstChild = node.children[0];
        if (firstChild.type === 'raw' && firstChild.value.startsWith(`<${AMIS_TAG}`)) {
          // 提取 lobeAmis 的属性
          const attributes: Record<string, string> = {};
          const attributeRegex = /(\w+)="([^"]*)"/g;
          let match;
          while ((match = attributeRegex.exec(firstChild.value)) !== null) {
            attributes[match[1]] = match[2];
          }

          // 找到结束标签
          let endTagIndex = -1;
          let content = '';
          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (child.type === 'raw' && child.value === `</${AMIS_TAG}>`) {
              endTagIndex = i;
              break;
            } else if (i > 0 && (i < endTagIndex || endTagIndex === -1) && child.type === 'text') {
                content += child.value;
              }
          }

          if (endTagIndex !== -1) {
            // 创建新的 lobeAmis 节点
            const newNode = {
              children: [{ type: 'text', value: content }],
              properties: attributes,
              tagName: AMIS_TAG,
              type: 'element',
            };

            // 替换原来的 p 节点
            parent.children.splice(index, 1, newNode);
            return [SKIP, index];
          } else {
            // 如果没有找到结束标签，保持原样
            return;
          }
        }
      }
      // 处理单独的 lobeAmis 标签
      else if (node.type === 'raw' && node.value.startsWith(`<${AMIS_TAG}`)) {
        // 创建新的 lobeAmis 节点
        const newNode = {
          children: [],
          properties: {},
          tagName: AMIS_TAG,
          type: 'element',
        };

        // 替换原来的节点
        parent.children.splice(index, 1, newNode);
        return [SKIP, index];
      }
    });
  };
}

export default rehypeAmisPlugin;
