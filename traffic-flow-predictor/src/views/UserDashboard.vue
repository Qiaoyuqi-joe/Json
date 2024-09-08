<template>
  <div class="user-dashboard">
    <h2>用户仪表板</h2>
    <div>
      <h3>个人信息</h3>
      <p>姓名: {{ profile.personal_info.name }}</p>
      <p>邮箱: {{ profile.personal_info.email }}</p>
      <p>上次登录: {{ profile.personal_info.last_login }}</p>
    </div>
    <div>
      <h3>用户评分</h3>
      <p>评论: {{ profile.user_rating.comment }}</p>
      <p>评分: {{ profile.user_rating.rating }}</p>
    </div>
    <div>
      <h3>用户活动</h3>
      <p>活跃时间: {{ profile.user_activity.active_time }}</p>
      <!-- 其他详细信息 -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      profile: {
        personal_info: {
          name: "John Doe",
          email: "john@example.com",
          last_login: "2024-01-01",
        },
        user_rating: { comment: "Great network quality.", rating: 4.5 },
        user_activity: { active_time: "2024-01-01 10:00:00" },
      },
    };
  },
};
</script>

<style scoped>
.user-dashboard {
  max-width: 800px;
  margin: auto;
}
</style>
