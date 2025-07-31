<template>
  <div class="p-4" v-if="is_apply_course">
    <van-empty v-if="apply_course.length === 0" description="暂无课程" image-size="200"></van-empty>
    <van-list :disabled="true">
      <van-cell v-for="(item,index) in apply_course" :key="index" :title="item.courseName"
                :value="item.isApply ? '未加入' : '已加入'"/>
    </van-list>
  </div>

  <div class="p-4" v-if="is_studying_course">
    <van-tabs v-model:active="studying_active">
      <van-tab title="学习中" class="pt-4">
        <van-empty v-if="studying_courses.length === 0" description="暂无课程" image-size="200"></van-empty>
        <div v-else class="flex flex-col">
          <van-button v-if="!is_start_studying" class="w-full" round type="success" @click="startStudyCourse">开始学习
          </van-button>
          <van-button v-if="is_start_studying" class="w-full" round type="success" @click="endStudyCourse">结束学习
          </van-button>
          <van-list :disabled="true" class="mt-4">
            <van-cell v-for="(item,index) in studying_courses" :key="index" :title="item.courseName"
                      :value="item.startTime"/>
          </van-list>
        </div>
      </van-tab>
      <van-tab title="未评价" class="pt-4">
        <div class="flex flex-col">
          <van-button class="w-full" round type="success" @click="getNoAppraiseCourses">
            获取未评价课程
          </van-button>
          <van-button class="w-full" style="margin-top: 20px" round type="success" @click="appraiseAllCourses">
            开始评价课程
          </van-button>
          <van-list :disabled="true" class="mt-4">
            <van-cell v-for="(item,index) in no_appraise_courses" :key="index" :title="item.courseName"
                      :value="item.isAppraise ? '已评价' : '未评价'"/>
          </van-list>
        </div>
      </van-tab>
    </van-tabs>
  </div>

  <div class="p-4" v-if="is_fif_read">
    <div class="flex flex-col">
      <van-button class="w-full" round type="success" @click="getFifReadParams">
        获取必要参数
      </van-button>
      <van-button class="w-full" round type="success" @click="completeFifRead" style="margin-top: 20px">
        一键完成口语作业
      </van-button>
      <van-cell-group inset style="margin-top: 20px">
        <van-field v-model="fif_semantic" type="digit" label="语义分数"/>
        <van-field v-model="fif_accuracy" type="digit" label="发音分数"/>
        <van-field v-model="fif_fluency" type="digit" label="流利度分数"/>
        <van-field v-model="fif_complete" type="digit" label="完整度分数"/>
        <van-field v-model="fif_score" type="digit" label="最终分数"/>
        <van-field v-model="fif_ansDetail" type="digit" label="单词细节分数"/>
      </van-cell-group>
    </div>
  </div>
  <van-popup v-model:show="is_loading" class="flex justify-center items-center"
             style="background: none;width: 20vw;height: 20vw;">
    <van-loading color="#1989fa" type="circular" size="50"/>
  </van-popup>
</template>
<script>
import {
  Button,
  Cell,
  CellGroup,
  Empty,
  List,
  Loading,
  Popup,
  Tab,
  Tabs,
  Field,
  showConfirmDialog,
  showDialog,
  showNotify
} from 'vant';

export default {
  components: {
    [Empty.name]: Empty,
    [List.name]: List,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Loading.name]: Loading,
    [Popup.name]: Popup,
    [Button.name]: Button,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Field.name]: Field,
  },
  data() {
    return {
      is_apply_course: false,
      is_studying_course: false,
      is_fif_read: false,
      is_loading: false,
      course_page: 1,
      course_maxID: null,
      apply_course: [],
      success_apply_course: [],
      studying_active: 0,
      studying_course_page: 1,
      studying_course_maxRegisterTime: null,
      is_start_studying: false,
      studying_setime: null,
      studying_courses: [],
      no_appraise_page: 1,
      no_appraise_maxRegisterTime: null,
      no_appraise_courses: [],
      fif_levelId: null,
      fif_questionId: null,
      fif_question_length: 0,
      fif_semantic: 0,
      fif_accuracy: 0,
      fif_fluency: 0,
      fif_complete: 0,
      fif_score: 0,
      fif_ansDetail: 0,
      fif_resultJson: []
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    /**
     * 初始化函数
     **/
    initialize() {
      // 功能判断,地址栏地址
      if (window.location.href === 'https://class.bigdata.ncvt.net/Student/Course/index.html') {
        this.is_apply_course = true;
        this.getCourses();
      }
      if (window.location.href === 'https://class.bigdata.ncvt.net/Student/My/myCourse.html') {
        this.is_studying_course = true;
        this.getStudyingCourses();
      }
      if (window.location.host === 'static.fifedu.com') {
        this.is_fif_read = true;
      }
    },
    /**
     * 获取可学习课程
     **/
    getCourses() {
      this.is_loading = true;
      this.$req.ncvtPOST('Student/Course/getCoursesCanApply.html', {
        p: this.course_page,
        maxID: this.course_maxID,
      })
          .then((response) => {
            this.course_maxID = response[0];
            if (response[1].length !== 0) {
              response[1].map((item) => {
                item.isApply = false
              })
              this.apply_course.push(...response[1]);
              this.course_page++;
              this.getCourses();
            } else {
              this.is_loading = false;
              if (this.apply_course.length === 0) {
                showDialog({
                  title: '提示',
                  message: '没有可学习的课程',
                })
              } else {
                showConfirmDialog({
                  title: '提示',
                  message: `共获取到${this.apply_course.length}个课程，要全部加入学习吗？`,
                })
                    .then(() => {
                      this.addCourseToStudy();
                    })
              }
            }
          })
          .catch((error) => {
            showDialog({
              title: '错误',
              message: `获取可学习课程失败:${error}`
            })
          });
    },
    /**
     * 将可学习课程添加到学习列表
     **/
    async addCourseToStudy() {
      let tempNumber = 0;
      for (let i = 0; i < this.apply_course.length; i++) {
        try {
          const response = await this.$req.ncvtPOST('Student/Course/courseRegister.html', {
            courseID: this.apply_course[i].courseID,
          });
          if (response === 1) {
            tempNumber++;
          }
        } catch (error) {
          console.error(`加入课程失败: ${this.apply_course[i].courseID} - ${error}`);
        }
      }
      if (this.apply_course.length === tempNumber) {
        showDialog({
          title: '提示',
          message: '所有课程已成功加入学习',
        })
      } else {
        showDialog({
          title: '警告',
          message: `部分课程加入学习失败。成功加入的课程数：${tempNumber}`
        })
      }
    },
    /**
     * 获取学习中的课程
     **/
    getStudyingCourses() {
      this.$req.ncvtPOST('Student/My/myCourse_xxz.html', {
        p: this.studying_course_page,
        maxRegisterTime: this.studying_course_maxRegisterTime,
      })
          .then((response) => {
            this.studying_course_maxRegisterTime = response[0];
            if (response[1].length !== 0) {
              response[1].map((item) => {
                item.startTime = '未学习完毕'
              })
              this.studying_courses.push(...response[1]);
              this.studying_course_page++;
              this.getStudyingCourses();
            } else {
              if (this.studying_courses.length === 0) {
                showDialog({
                  title: '提示',
                  message: '没有正在学习的课程'
                })
              } else {
                showDialog({
                  title: '提示',
                  message: `共获取到${this.studying_courses.length}个正在学习的课程，请点击开始学习按钮开始学习`
                })
              }
            }
          })
          .catch((error) => {
            showDialog({
              title: '错误',
              message: `获取学习中课程失败:${error}`
            })
          });
    },
    /**
     * 开始学习课程
     **/
    async startStudyCourse() {
      this.is_loading = true;
      let tempNumber = 0;
      for (let i = 0; i < this.studying_courses.length; i++) {
        try {
          const response = await this.$req.ncvtPOST('Student/Course/getSecondsAndRemmberStartTime.html', {
            courseID: this.studying_courses[i].courseID,
          })
          if (response !== '') {
            this.studying_courses[i].startTime = response;
            tempNumber++;
          }
        } catch (error) {
          console.error(`开始学习课程失败: ${this.studying_courses[i].courseID} - ${error}`);
        }
      }
      if (this.studying_courses.length === tempNumber) {
        showDialog({
          title: '提示',
          message: '所有课程已成功开始学习',
        })
      } else {
        showDialog({
          title: '警告',
          message: `部分课程开始学习失败。成功开始学习的课程数：${tempNumber}`
        })
      }
      this.is_loading = false;
      this.is_start_studying = true;
      this.studying_courses.sort((a, b) => {
        return Number(a.startTime) - Number(b.startTime);
      })
      this.courseCountdown();
    },
    /**
     * 结束学习课程
     **/
    async endStudyCourse() {
      this.is_loading = true;
      let tempNumber = 0;
      for (let i = 0; i < this.studying_courses.length; i++) {
        try {
          const response = await this.$req.ncvtPOST('Student/Course/remmberStudyTime.html', {
            courseID: this.studying_courses[i].courseID,
          })
          if (response !== '') {
            this.studying_courses[i].startTime = response
            tempNumber++
          }
        } catch (error) {
          console.error(`结束学习课程失败: ${this.studying_courses[i].courseID} - ${error}`);
        }
      }
      if (this.studying_courses.length === tempNumber) {
        showDialog({
          title: '提示',
          message: '所有课程已成功结束学习',
        })
      } else {
        showDialog({
          title: '警告',
          message: `部分课程结束学习失败。已结束学习的课程数：${tempNumber}`
        })
      }
      this.is_loading = false;
      this.is_start_studying = false;
      clearInterval(this.studying_setime);
    },
    /**
     * 课程倒计时效果
     **/
    courseCountdown() {
      this.studying_setime = setInterval(() => {
        this.studying_courses.forEach((course) => {
          if (Number(course.startTime) === 0) {
            this.endSingleStudyCourse(course.courseID, course.courseName);
            return;
          }
          course.startTime = Number(course.startTime) - 1
        });
      }, 1000)
    },
    /**
     * 单个结束学习课程
     * @param courseID {string} 课程ID
     * @param courseName {string} 课程名称
     **/
    async endSingleStudyCourse(courseID, courseName) {
      try {
        const response = await this.$req.ncvtPOST('Student/Course/remmberStudyTime.html', {
          courseID: courseID,
        });
        if (response === 0) {
          this.studying_courses = this.studying_courses.filter(course => course.courseID !== courseID);
          showNotify({type: 'success', message: `课程 ${courseName} 学习完毕`});
          if (this.studying_courses.length === 0) {
            this.is_start_studying = false;
            clearInterval(this.studying_setime);
            showNotify({type: 'success', message: '所有课程学习完毕，已停止倒计时'});
          }
        }
      } catch (error) {
        console.error(`结束学习课程失败: ${courseID} - ${error}`);
        showNotify({type: 'danger', message: `课程 ${courseName} 结束学习失败`});
      }
    },
    /**
     * 获取未评价课程
     **/
    getNoAppraiseCourses() {
      this.$req.ncvtPOST('Student/My/myCourse_wpj.html', {
        p: this.no_appraise_page,
        maxRegisterTime: this.no_appraise_maxRegisterTime,
      })
          .then((response) => {
            this.no_appraise_maxRegisterTime = response[0];
            if (response[1].length !== 0) {
              response[1].map((item) => {
                item.isAppraise = false;
              })
              this.no_appraise_courses.push(...response[1]);
              this.no_appraise_page++;
              this.getNoAppraiseCourses();
            } else {
              if (this.no_appraise_courses.length === 0) {
                showDialog({
                  title: '提示',
                  message: '没有未评价的课程'
                })
              } else {
                showDialog({
                  title: '提示',
                  message: `共获取到${this.no_appraise_courses.length}个未评价的课程`
                })
              }
            }
          })
          .catch((error) => {
            showDialog({
              title: '错误',
              message: `获取未评价课程失败:${error}`
            })
          });
    },
    /**
     * 评价所有课程
     **/
    async appraiseAllCourses() {
      if (this.no_appraise_courses.length === 0) {
        showDialog({
          title: '提示',
          message: '没有未评价的课程'
        });
        return;
      }
      this.is_loading = true;
      let tempNumber = 0;
      for (let i = 0; i < this.no_appraise_courses.length; i++) {
        try {
          const response = await this.$req.ncvtPOST('Student/Course/comment.html', {
            courseID: this.no_appraise_courses[i].courseID,
            stars: 5,
            commentStr: '非常好的课程，内容丰富，讲解清晰，非常感谢老师的辛勤付出！',
          });
          if (response === 2) {
            this.no_appraise_courses[i].isAppraise = true;
            tempNumber++;
          }
        } catch (error) {
          console.error(`评价课程失败: ${this.no_appraise_courses[i].courseID} - ${error}`);
        }
      }
      if (this.no_appraise_courses.length === tempNumber) {
        showDialog({
          title: '提示',
          message: '所有课程已成功评价，两秒后清空未评价课程列表',
        })
      } else {
        showDialog({
          title: '警告',
          message: `部分课程评价失败。成功评价的课程数：${tempNumber}。两秒后清空未评价课程列表`
        })
      }
      this.is_loading = false;
      setTimeout(() => {
        this.no_appraise_courses = []
      }, 2000)
    },
    /**
     * 获取FIF口语任务信息
     * @returns {Object} URL参数对象
     **/
    getFifReadParams() {
      this.is_loading = true;
      const fif_url = window.location.href
      // 1. 使用正则提取 ? 后的所有参数
      const paramString = fif_url.match(/\?(.*)/)?.[1] || '';
      // 2. 分割成键值对
      const paramPairs = paramString.split('&');
      // 3. 转换为对象
      const paramsObj = paramPairs.reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        if (key) acc[key] = value || ''; // 处理无值情况（如 `key=`）
        return acc;
      }, {});
      this.fif_levelId = paramsObj.gId;
      this.$req.fifPOST('https://moral.fifedu.com/kyxl-app/column/getLevelInfo', {
        levelId: this.fif_levelId
      })
          .then((response) => {
            this.fif_questionId = response.data.content.moshi[1].question.questionid
            this.fif_question_length = response.data.content.moshi[1].question.qcontent.item[0].questions.length
            showDialog({
              title: '提示',
              message: '获取必要参数完成，请点击一键完成口语作业按钮',
            })
          })
          .catch((error) => {
            showNotify({type: 'danger', message: `获取必要参数失败：${error}`});
          })
          .finally(() => {
            this.is_loading = false;
          })
    },
    /**
     * 完成FIF口语阅读
     **/
    completeFifRead() {
      if (!this.fif_levelId || !this.fif_questionId || this.fif_question_length === 0) {
        showNotify({type: 'danger', message: '请先获取必要参数'});
        return;
      }
      this.is_loading = true;
      for (let i = 0; i < this.fif_question_length; i++) {
        this.fif_resultJson.push({
          questionId: `${this.fif_questionId}#0#${i}`,
          semantic: Number(this.fif_semantic),
          accuracy: Number(this.fif_accuracy),
          fluency: Number(this.fif_fluency),
          complete: Number(this.fif_complete),
          score: Number(this.fif_score),
          ansDetail: `word#${this.fif_ansDetail}`,
          learn_time: 3
        });
      }
      this.fif_resultJson = JSON.stringify(this.fif_resultJson);
      console.log(this.fif_resultJson);
      this.$req.fifPOST('https://moral.fifedu.com/kyxl-app-challenge/evaluation/submitChallengeResults', {
        taskId: 0,
        levelId: this.fif_levelId,
        studentId: JSON.parse(localStorage.getItem('userInfo')).data.userId,
        resultJson: this.fif_resultJson
      })
          .then((response) => {
            if (response.status === 1) {
              showDialog({
                title: '提示',
                message: 'FIF口语作业已完成',
              });
            } else {
              showNotify({type: 'danger', message: `FIF口语作业完成失败：${response.msg}`});
            }
          })
          .catch((error) => {
            showNotify({type: 'danger', message: `FIF口语作业完成失败：${error}`});
          })
          .finally(() => {
            this.is_loading = false;
          });
    }
  }
}
</script>


<style scoped>

</style>
