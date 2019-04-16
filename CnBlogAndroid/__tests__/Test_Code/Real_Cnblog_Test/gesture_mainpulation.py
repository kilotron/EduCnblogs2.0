# coding:utf-8
'''
description:手势操作
'''
class gesture_mainpulation:
    def swipe_left(self, driver):
        '''左滑'''
        x = driver.get_window_size()['width']
        y = driver.get_window_size()['height']
        driver.swipe(x*7/8, y/4, x/8, y/4, 1000)

    def swipe_right(self, driver):
        '''右滑'''
        x = driver.get_window_size()['width']
        y = driver.get_window_size()['height']
        driver.swipe(x/8, y/4, x*7/8, y/4, 1000)

    def swipe_down(self, driver):
        '''下滑'''
        x = driver.get_window_size()['width']
        y = driver.get_window_size()['height']
        driver.swipe(x/2, y*6/8, x/2, y/8, 1000)

    def swipe_up(self, driver):
        '''上滑'''
        x = driver.get_window_size()['width']
        y = driver.get_window_size()['height']
        driver.swipe(x/2, y*3/8, x/2, y*7/8, 1000)