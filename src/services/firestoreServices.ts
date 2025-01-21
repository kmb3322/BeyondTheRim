// src/services/firestoreService.ts
import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from '../firebaseConfig';
  
  /**
   * 유저가 농구 슛 영상을 업로드하면 Firestore에 저장
   * @param s3Url S3에 업로드된 영상 URL
   * @param score 분석된 점수(아직 없으면 null)
   */
  export async function saveShotData(
    s3Url: string,
    score: number | null,
    processed?: string | null
  ) {
    if (!auth.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }
    const userId = auth.currentUser.uid;
    const docId = uuidv4();
  
    await setDoc(doc(db, 'users', userId, 'shots', docId), {
      s3Url,
      score,
      processed: processed ?? null, // 가공된 영상 URL (초기에는 null)
      createdAt: serverTimestamp(),
    });
  }
  
  /**
   * 현재 유저의 슛 정보(Shots) 목록을 불러옴
   */
  export async function getUserShots() {
    if (!auth.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }
    const userId = auth.currentUser.uid;
  
    const shotsRef = collection(db, 'users', userId, 'shots');
    const q = query(shotsRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
  
    const shotList: Array<{
      id: string;
      s3Url: string;
      score: number | null;
      processed: string | null;
      createdAt?: any;
    }> = [];
  
    snapshot.forEach((docSnap) => {
      shotList.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as any);
    });
  
    return shotList;
  }
  