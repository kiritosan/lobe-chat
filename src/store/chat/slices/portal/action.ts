import { StateCreator } from 'zustand/vanilla';

import { ARTIFACT_AMIS_REGEX, ARTIFACT_TAG_REGEX } from '@/const/plugin';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { PortalArtifact } from '@/types/artifact';

import { PortalFile } from './initialState';

export interface ChatPortalAction {
  closeArtifact: () => void;
  closeFilePreview: () => void;
  closeMessageDetail: () => void;
  closeToolUI: () => void;
  internal_updateArtifactCode: (id: string, code: string) => void;
  openArtifact: (artifact: PortalArtifact) => void;
  openFilePreview: (portal: PortalFile) => void;
  openMessageDetail: (messageId: string) => void;
  openToolUI: (messageId: string, identifier: string) => void;
  togglePortal: (open?: boolean) => void;
  updateArtifactContent: (content: PortalArtifact) => void;
}

export const chatPortalSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatPortalAction
> = (set, get) => ({
  closeArtifact: () => {
    get().togglePortal(false);
    set({ portalArtifact: undefined }, false, 'closeArtifact');
  },
  closeFilePreview: () => {
    set({ portalFile: undefined }, false, 'closeFilePreview');
  },
  closeMessageDetail: () => {
    set({ portalMessageDetail: undefined }, false, 'openMessageDetail');
  },
  closeToolUI: () => {
    set({ portalToolMessage: undefined }, false, 'closeToolUI');
  },
  internal_updateArtifactCode: (id, code) => {
    const original = chatPortalSelectors.artifactMessageContent(id)(get());
    console.log('原始数据', original);
    const updated = ARTIFACT_TAG_REGEX.test(original)
      ? original.replace(
          ARTIFACT_AMIS_REGEX,
          // 保留可能存在的标签属性
          (fullMatch, p1, offset, str, groups) => fullMatch.replace(groups.content, code), // ✅ 仅替换内容
        )
      : `${original}\n<lobeAmis>${code}</lobeAmis>`; // ✅ 追加新标签

    get().internal_updateMessageContent(id, updated);
  },
  openArtifact: (artifact) => {
    get().togglePortal(true);

    console.log('openArtifact', artifact);

    set({ portalArtifact: artifact }, false, 'openArtifact');
  },
  openFilePreview: (portal) => {
    get().togglePortal(true);

    console.log('openFilePreview', portal);

    set({ portalFile: portal }, false, 'openFilePreview');
  },

  openMessageDetail: (messageId) => {
    get().togglePortal(true);

    console.log('openMessageDetail', messageId);

    set({ portalMessageDetail: messageId }, false, 'openMessageDetail');
  },
  openToolUI: (id, identifier) => {
    get().togglePortal(true);

    console.log('openToolUI', id, identifier);

    set({ portalToolMessage: { id, identifier } }, false, 'openToolUI');
  },

  togglePortal: (open) => {
    const showInspector = open === undefined ? !get().showPortal : open;

    console.log('togglePortal', showInspector);

    set({ showPortal: showInspector }, false, 'toggleInspector');
  },
  // updateArtifactContent: (content) => {
  //   set({ portalArtifact: content }, false, 'updateArtifactContent');
  // },
  // 为了解决参数“content”隐式具有“any”类型的问题，这里明确指定其类型为 PortalArtifact
  updateArtifactContent: (content: string | PortalArtifact) => {
    console.log('updateArtifactContent', content);
    // set({ portalArtifact: typeof content === 'string' ? { content } : content }, false, 'updateArtifactContent');
  },
});
