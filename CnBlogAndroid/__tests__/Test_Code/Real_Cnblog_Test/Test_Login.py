import time
import unittest
import Driver_Configure

class test_login(unittest.TestCase):
    def setUp(self):
        self.driver = Driver_Configure.driver_configure().get_driver()

    def touch_tap(self, x, y, duration=200):  # 点击坐标  ,x1,x2,y1,y2,duration
        '''
        method explain:点击坐标
        parameter explain：【x,y】坐标值,【duration】:给的值决定了点击的速度
        Usage:
            device.touch_coordinate(277,431)      #277.431为点击某个元素的x与y值
        '''
        screen_width = self.driver.get_window_size()['width']  # 获取当前屏幕的宽
        screen_height = self.driver.get_window_size()['height']  # 获取当前屏幕的高
        a = (float(x) / screen_width) * screen_width
        x1 = int(a)
        b = (float(y) / screen_height) * screen_height
        y1 = int(b)
        self.driver.tap([(x1, y1), (x1, y1)], duration)

    def test_login(self):
        time.sleep(5)
        start_button = self.driver.find_element_by_class_name("android.widget.TextView")
        start_button.click()
        time.sleep(5)
        login_name = self.driver.find_element_by_class_name("android.widget.EditText")

        self.driver.tap([(332,644), (1132, 760)], 100)
        login_name.send_keys("cn279408285")
        login_pw = self.driver.find_element_by_class_name("android.widget.EditText")
        # self.driver.tap([(332, 868), (1132, 984)], 100)

        time.sleep(3)
        login_button = self.driver.find_element_by_class_name("android.widget.Button")
        login_button.send_keys("cn~wf1020")
        time.sleep(2)
        login_button.click()
        time.sleep(2)
        self.driver.tap([(0,96), (1440,2560)], 200)
        self.driver.find_element_by_class_name("android.webkit.WebView").click()
        self.touch_tap(551,523)

        time.sleep(10)

    # def test_login(self):



    def tearDown(self):
        self.driver.quit()

