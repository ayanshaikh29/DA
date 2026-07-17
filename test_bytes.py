with open('C:/Users/HP/Desktop/Portfolios Ayan/DA/about.html', 'rb') as f:
    data = f.read()

# Let's find the position of "deliverables"
idx = data.find(b"deliverables")
if idx != -1:
    print(data[idx:idx+50])
