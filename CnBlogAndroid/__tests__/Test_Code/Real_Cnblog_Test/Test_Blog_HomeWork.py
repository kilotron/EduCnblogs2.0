import time
import unittest
import Driver_Configure
import gesture_mainpulation

class Test_Blog_HomeWork(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = Driver_Configure.driver_configure().get_driver()
        cls.GM = gesture_mainpulation.gesture_mainpulation()


    def test_blog(self):
        time.sleep(5)
        My_class = self.driver.find_element_by_xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.HorizontalScrollView[1]/android.view.ViewGroup[1]/android.view.ViewGroup[3]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.ImageView[1]")
        My_class.click()
        time.sleep(2)
        Class_name = self.driver.find_element_by_xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.view.ViewGroup[1]/android.widget.ScrollView[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.TextView[1]")
        Class_name.click()
        time.sleep(3)
        self.GM.swipe_left(self.driver)
        # 左滑一下，滑到作业界面
        time.sleep(3)
        self.GM.swipe_up(self.driver)
        # 下拉刷新
        time.sleep(3)
        homework_1 = self.driver.find_element_by_xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.support.v4.view.ViewPager[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.support.v4.view.ViewPager[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.widget.ScrollView[1]/android.view.ViewGroup[1]/android.view.ViewGroup[3]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.TextView[1]")
        homework_1.click()
        time.sleep(3)
        back_button = self.driver.find_element_by_xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.Button[1]/android.view.ViewGroup[1]/android.widget.ImageView[1]")
        back_button.click()
        time.sleep(3)
        for i in range (3, 6):
            homework_path = "//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.support.v4.view.ViewPager[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.support.v4.view.ViewPager[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.widget.ScrollView[1]/android.view.ViewGroup[1]/android.view.ViewGroup[" + str(i) + "]/android.view.ViewGroup[1]/android.view.ViewGroup[1]"
            look_blog = self.driver.find_element_by_xpath(homework_path)
            look_blog.click()
            time.sleep(5)
            back_button = self.driver.find_element_by_xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.Button[1]/android.view.ViewGroup[1]/android.widget.ImageView[1]")
            back_button.click()
            time.sleep(4)

        # 左滑一下，滑倒博文界面
        self.GM.swipe_left(self.driver)
        time.sleep(2)

        for i in range(1, 4):
            blog_path = "//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.support.v4.view.ViewPager[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.support.v4.view.ViewPager[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.ScrollView[1]/android.view.ViewGroup[1]/android.view.ViewGroup[" + str(i) + "]/android.view.ViewGroup[1]/android.view.ViewGroup[1]"
            look_blog = self.driver.find_element_by_xpath(blog_path)
            look_blog.click()
            time.sleep(5)
            # 收藏按钮
            collect_button = self.driver.find_element_by_xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.view.ViewGroup[2]/android.view.ViewGroup[2]/android.widget.ImageView[1]")
            collect_button.click()
            time.sleep(3)
            label_button = self.driver.find_element_by_xpath("//android.view.ViewGroup/android.widget.EditText[3]")
            label_button.click()
            label_button.send_keys("没有所谓的标签" + str(i))
            time.sleep(3)
            abstract_button = self.driver.find_element_by_xpath("//android.view.ViewGroup/android.widget.EditText[4]")
            abstract_button.click()
            abstract_button.send_keys("也没有所谓的摘要" + str(i))
            time.sleep(3)
            # 最后的收藏按钮
            add_collection = self.driver.find_element_by_xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.ScrollView[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.Button[1]/android.widget.TextView[1]")
            add_collection.click()
            time.sleep(4)
            # 然后返回去
            back_button = self.driver.find_element_by_xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.Button[1]/android.view.ViewGroup[1]/android.widget.ImageView[1]")
            back_button.click()
            time.sleep(5)


        self.GM.swipe_down(self.driver)
        time.sleep(2)
        self.GM.swipe_down(self.driver)
        time.sleep(10)





    def test_homework(self):
        time.sleep(5)
        My_class = self.driver.find_element_by_xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.HorizontalScrollView[1]/android.view.ViewGroup[1]/android.view.ViewGroup[3]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.ImageView[1]")
        My_class.click()
        time.sleep(2)
        Class_name = self.driver.find_element_by_xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.view.ViewGroup[1]/android.widget.ScrollView[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.widget.TextView[1]")
        Class_name.click()
        time.sleep(3)
        self.GM.swipe_left(self.driver)
        # 左滑一下，滑到作业界面
        for i in range (1, 200):
            time.sleep(5)
            # 下拉刷新
            self.GM.swipe_up(self.driver)
            time.sleep(2)
            self.GM.swipe_up(self.driver)
            time.sleep(2)
            self.GM.swipe_down(self.driver)
            time.sleep(2)
            self.GM.swipe_up(self.driver)
            time.sleep(2)
            self.GM.swipe_up(self.driver)
            time.sleep(2)
            self.GM.swipe_up(self.driver)
            time.sleep(2)
            self.GM.swipe_down(self.driver)
            time.sleep(4)
            self.GM.swipe_up(self.driver)
            time.sleep(2)
            self.GM.swipe_up(self.driver)
            time.sleep(2)
            self.GM.swipe_up(self.driver)
            time.sleep(2)
            if i%2 == 0 :
                self.GM.swipe_right(self.driver)
            else:
                self.GM.swipe_left(self.driver)


    def tearDownClass(cls):
        cls.driver.quit()

