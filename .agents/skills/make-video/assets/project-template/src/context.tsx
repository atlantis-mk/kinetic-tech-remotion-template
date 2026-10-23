import React,{createContext,useContext} from 'react';
import type {Scene} from './content';
export const SceneContext=createContext<Scene|null>(null);
type DataMap={[K in Scene['kind']]:Extract<Scene,{kind:K}>['data']};
export function useData<K extends Scene['kind']>(kind:K):DataMap[K] {
 const scene=useContext(SceneContext);if(!scene||scene.kind!==kind)throw new Error(`Scene data mismatch: ${kind}`);
 return scene.data as unknown as DataMap[K];
}
