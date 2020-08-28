import os


def makeHardLink(fromFile, toFile):
    if not os.path.exists(toFile):
        os.makedirs(toFile)
    files = os.listdir(fromFile)
    for f in files:
        fromF = os.path.join(fromFile, f)
        toF = os.path.join(toFile, f)
        if os.path.isdir(fromF):
            makeHardLink(fromF, toF)
        else:
            cmdStr = "mklink /H \""+toF+"\" \"" + fromF+"\""
            print(cmdStr)
            p = os.popen(cmdStr)
            print(p)


if __name__ == '__main__':
    sourcePath = input()
    targetPath = input()
    makeHardLink(sourcePath, targetPath)
