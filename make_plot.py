import numpy as np
import matplotlib.pyplot as plt

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

plt.show()