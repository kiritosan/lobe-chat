import { Button, CodeEditor, Input, Modal } from '@lobehub/ui';
import axios from 'axios';
// import { ARTIFACT_TAG_REGEX } from '@/const/plugin';
import { memo, useEffect, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';
import { ArtifactDisplayMode } from '@/store/chat/slices/portal/initialState';
import { ArtifactType } from '@/types/artifact';

import Renderer from './Renderer';

const ArtifactsUI = memo(() => {
  const [
    messageId,
    displayMode,
    isMessageGenerating,
    artifactType,
    artifactContent,
    artifactCodeLanguage,
    isArtifactTagClosed,
  ] = useChatStore((s) => {
    console.log('求查询一下3', s);

    const messageId = chatPortalSelectors.artifactMessageId(s) || '';

    return [
      messageId,
      s.portalArtifactDisplayMode,
      chatSelectors.isMessageGenerating(messageId)(s),
      chatPortalSelectors.artifactType(s),
      chatPortalSelectors.artifactCode(messageId)(s),
      chatPortalSelectors.artifactCodeLanguage(s),
      chatPortalSelectors.isArtifactTagClosed(messageId)(s),
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageName, setPageName] = useState('');
  const [pagePath, setPagePath] = useState('');

  useEffect(() => {
    // when message generating , check whether the artifact is closed
    // if close, move the display mode to preview
    if (isMessageGenerating && isArtifactTagClosed && displayMode === ArtifactDisplayMode.Code) {
      useChatStore.setState({ portalArtifactDisplayMode: ArtifactDisplayMode.Preview });
    }
  }, [isMessageGenerating, displayMode, isArtifactTagClosed]);

  console.log('displayMode', displayMode);
  console.log('artifactType', artifactType);

  const language = useMemo(() => {
    switch (artifactType) {
      case ArtifactType.React: {
        return 'tsx';
      }

      case ArtifactType.Code: {
        return artifactCodeLanguage;
      }

      case ArtifactType.Python: {
        return 'python';
      }

      default: {
        return 'html';
      }
    }
  }, [artifactType, artifactCodeLanguage]);

  // make sure the message and id is valid
  if (!messageId) return;

  // show code when the artifact is not closed or the display mode is code or the artifact type is code
  // const showCode =
  //   !isArtifactTagClosed ||
  //   displayMode === ArtifactDisplayMode.Code ||
  //   artifactType === ArtifactType.Code;

  const handleOk = async () => {
    console.log('保存代码33', pageName, pagePath);
    const postUrl =
      'https://glm-test.glodon.com/api/open/dynamic/page/metadata/save?appid=appidDepartmentA&easterEgg=glmEffective778899';
    const params = JSON.parse(artifactContent);
    const { body, ...rest } = params;
    const newObj = { ...rest, metadata: body };
    newObj.name = pageName;
    newObj.code = pagePath;
    await axios.post(postUrl, newObj);
    // debugger
    setIsModalOpen(false);
    setPageName('');
    setPagePath('');
  };

  // const items: FormProps['items'] = [
  //   {
  //     children: [
  //       {
  //         children: <Input />,
  //         desc: 'Default width of the sidebar when starting',
  //         label: 'Default Width',
  //         minWidth: undefined,
  //         name: 'sidebarWidth',
  //       },
  //     ],
  //     title: 'Quick Setting Sidebar',
  //   },
  // ];

  return (
    <Flexbox
      className={'portal-artifact'}
      flex={1}
      gap={8}
      height={'100%'}
      paddingInline={12}
      style={{ minHeight: 0, overflow: 'auto' }}
    >
      {/* {
        <>
          <Highlighter
            language={language || 'txt'}
            style={{ maxHeight: '100%', overflow: 'scroll' }}
          >
            {artifactContent}
          </Highlighter>

          <Renderer content={artifactContent} type={artifactType} />
        </>
      } */}

      {
        // <Highlighter language={language || 'txt'} style={{ maxHeight: '100%', overflow: 'hidden' }}>
        //   {artifactContent}
        // </Highlighter>
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <Flexbox gap={8}>
              {/* <button
                  type="button"
                  onClick={async () => {
                    try {
                      console.log('保存代码1111', artifactContent, language)
                      const params = JSON.parse(artifactContent);
                      let postUrl = ''
                      if (params.serviceName) { // 保存后端元数据
                        postUrl = 'https://glm-test.glodon.com/api/open/dynamic/api/metadata/save?appid=appidDepartmentA&easterEgg=glmEffective778899'
                      }
                      if (postUrl === '') {
                        return;
                      }

                      await axios.post(postUrl, params);
                      // 可以添加成功提示
                    } catch (e) {
                      console.error('保存失败:', e);
                    }
                  }}
                >
                  保存代码2
                </button> */}

              <Button
                onClick={async () => {
                  try {
                    console.log('保存代码1111', artifactContent, language);
                    const params = JSON.parse(artifactContent);
                    let postUrl = '';
                    if (params.serviceName) {
                      // 保存后端元数据
                      postUrl =
                        'https://glm-test.glodon.com/api/open/dynamic/api/metadata/save?appid=appidDepartmentA&easterEgg=glmEffective778899';
                    } else {
                      setIsModalOpen(true);
                      // postUrl =
                      //   'https://glm-test.glodon.com/api/open/dynamic/page/metadata/save?appid=appidDepartmentA&easterEgg=glmEffective778899';
                    }
                    if (postUrl === '') {
                      return;
                    }

                    await axios.post(postUrl, params);
                    // 可以添加成功提示
                  } catch (e) {
                    console.error('保存失败:', e);
                  }
                }}
                type="primary"
              >
                保存代码2
              </Button>
              <Modal
                onCancel={() => setIsModalOpen(false)}
                onOk={handleOk}
                open={isModalOpen}
                title="保存"
              >
                <span>页面路径：</span>
                <Input onChange={(e) => setPagePath(e.target.value)} value={pagePath} />
                <span>页面名称：</span>
                <Input onChange={(e) => setPageName(e.target.value)} value={pageName} />
              </Modal>

              <CodeEditor
                language={language || 'txt'}
                onValueChange={(newValue: string) => {
                  // useChatStore.getState().internal_updateMessageContent(messageId, newValue);
                  useChatStore.getState().internal_updateArtifactCode(messageId, newValue);
                }}
                style={{ maxHeight: '100%', overflow: 'auto' }}
                value={artifactContent}
              />
            </Flexbox>
          </div>
          <div style={{ flex: 1 }}>
            <Renderer content={artifactContent} type={artifactType} />
          </div>
        </div>
      }
    </Flexbox>
  );
});

export default ArtifactsUI;
