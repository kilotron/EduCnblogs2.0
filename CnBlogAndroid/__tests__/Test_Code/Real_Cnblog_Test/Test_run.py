import HTMLTestRunner
import time
import unittest
import os
from Test_Login import test_login
from Test_announcement import test_borad
from Test_Blog_HomeWork import Test_Blog_HomeWork

if __name__ == '__main__':
    suite = unittest.TestSuite()
    tests = [Test_Blog_HomeWork("test_blog")]
    suite.addTests(tests)
    # suite = unittest.TestLoader().loadTestsFromTestCase(test_borad)
    # suite = unittest.TestSuite()
    # suite.addTests(unittest.TestLoader().loadTestsFromTestCase(Test_Login.test_login))
    
#这一步是在当前文件夹里自动生成一个测试报告，测试报告名称就叫：UnittestTextReport.txt.
    filename =  'F:/' + 'try' + '.txt'           #这个路径改成自己的目录路径
    fp = open(filename, 'wb')
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)
    fp.close()