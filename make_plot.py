import numpy as np
import matplotlib.pyplot as plt

<<<<<<< HEAD
data = [np.asarray([0.667]), np.asarray([0.6]), np.asarray([0.5, 0.5, 0.5]),
        np.asarray([1.0, 0.5, 1.0]), np.asarray([0.5, 0.5]), np.asarray([1.0, 1.0])]
fig, ax = plt.subplots()
ax.set_title('Average score before and after training')
plt.ylabel('Average score')

plt.boxplot(data, labels=['a', 'b', 'c', 'd', 'e', 'f'])
ax.set_ylim([0.0, 1.09])
=======
data = [np.asarray([1.0, 1.0, 1.0]),
        np.asarray([2.0, 1.0, 2.0]),
        np.asarray([1.0, 1.0]),
        np.asarray([2.0, 2.0])]

fig, ax = plt.subplots()
ax.set_title('Mean score before and after training')
plt.ylabel('Mean score')
plt.boxplot(data, labels=['O1 3-ply before training',
                          'O1 3-ply after training', 'O2 3-ply before training', 'O2 3-ply after training'])
ax.set_ylim([0.0, 5.0])
>>>>>>> 2260d12b10483802550567b86ee3e362112a52cb

plt.show()