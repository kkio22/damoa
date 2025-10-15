/**
 * 크롤링 트리거 스크립트
 * CLI에서 직접 크롤링을 실행할 수 있습니다
 * 
 * 사용법:
 * npm run crawl:trigger
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * 크롤링 트리거
 */
const triggerCrawling = async () => {
  try {
    console.log('🚀 크롤링 트리거 중...\n');

    const response = await axios.post(`${API_URL}/api/crawling/trigger`, {
      platform: 'daangn',
      locations: [
        '서울특별시',
        '경기도',
        '인천광역시',
        '부산광역시',
        '대구광역시',
      ],
    });

    console.log('✅ 크롤링 트리거 성공!');
    console.log('응답:', JSON.stringify(response.data, null, 2));
    console.log('\n📊 크롤링 상태 조회: GET', `${API_URL}/api/crawling/status`);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 크롤링 트리거 실패:', error.response?.data || error.message);
    } else {
      console.error('❌ 오류:', error);
    }
    process.exit(1);
  }
};

/**
 * 크롤링 상태 조회
 */
const checkStatus = async () => {
  try {
    console.log('📊 크롤링 상태 조회 중...\n');

    const response = await axios.get(`${API_URL}/api/crawling/status`);

    console.log('✅ 크롤링 상태:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 상태 조회 실패:', error.response?.data || error.message);
    } else {
      console.error('❌ 오류:', error);
    }
    process.exit(1);
  }
};

/**
 * 메인 함수
 */
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0] || 'trigger';

  switch (command) {
    case 'trigger':
      await triggerCrawling();
      break;
    case 'status':
      await checkStatus();
      break;
    default:
      console.log('사용법:');
      console.log('  npm run crawl:trigger          # 크롤링 트리거');
      console.log('  npm run crawl:trigger status   # 크롤링 상태 조회');
      break;
  }
};

main();

